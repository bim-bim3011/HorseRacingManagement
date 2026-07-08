package com.swp391.horseracing.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.horseracing.dto.request.PayosCreateRequest;
import com.swp391.horseracing.dto.response.PayosCreateResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.PayosDeposit;
import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.betting.WalletTransaction;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.PayosDepositRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.repository.WalletRepository;
import com.swp391.horseracing.repository.WalletTransactionRepository;
import com.swp391.horseracing.service.PayosService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.WebhookData;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PayosServiceImpl implements PayosService {

    PayOS payOS;
    PayosDepositRepository payosDepositRepository;
    UserRepository userRepository;
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;
    ObjectMapper objectMapper;

    @Override
    public PayosCreateResponse createPaymentLink(PayosCreateRequest request) {
        try {
            // 1. Lấy User hiện tại từ SecurityContext
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            // 2. Sinh orderCode duy nhất (timestamp + random để tránh trùng)
            long orderCode = System.currentTimeMillis() / 1000;

            // 3. Lưu đơn nạp tiền PENDING xuống Database
            PayosDeposit deposit = PayosDeposit.builder()
                    .user(user)
                    .orderCode(orderCode)
                    .amount(BigDecimal.valueOf(request.getAmount()))
                    .status(PayosDeposit.DepositStatus.PENDING)
                    .build();
            payosDepositRepository.save(deposit);
            log.info("PayOS: Created deposit - orderCode={}, amount={}, userId={}",
                    orderCode, request.getAmount(), user.getId());

            // 4. Tạo dữ liệu gửi sang PayOS (SDK v2 API)
            CreatePaymentLinkRequest paymentData = CreatePaymentLinkRequest.builder()
                    .orderCode(orderCode)
                    .amount(request.getAmount().longValue())
                    .description("Nap tien " + request.getAmount() + " VND")
                    .returnUrl("http://localhost:5173/deposit-result")
                    .cancelUrl("http://localhost:5173/deposit-result?cancelled=true")
                    .build();

            // 5. Gọi PayOS SDK tạo Payment Link
            CreatePaymentLinkResponse result = payOS.paymentRequests().create(paymentData);

            // 6. Cập nhật paymentLinkId vào Database
            deposit.setPaymentLinkId(result.getPaymentLinkId());
            payosDepositRepository.save(deposit);

            log.info("PayOS: Payment link created - orderCode={}, checkoutUrl={}",
                    orderCode, result.getCheckoutUrl());

            // 7. Trả checkoutUrl về cho Frontend
            return PayosCreateResponse.builder()
                    .checkoutUrl(result.getCheckoutUrl())
                    .orderCode(orderCode)
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("PayOS: Failed to create payment link", e);
            throw new RuntimeException("Không thể tạo link thanh toán PayOS: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void handleWebhook(String jsonBody) throws Exception {
        log.info("PayOS Webhook: Received - {}", jsonBody);

        // 1. Parse JSON body thành Map
        @SuppressWarnings("unchecked")
        Map<String, Object> webhookBody = objectMapper.readValue(jsonBody, Map.class);

        // 2. Verify chữ ký webhook bằng checksumKey (SDK v2 API)
        WebhookData webhookData = payOS.webhooks().verify(webhookBody);

        long orderCode = webhookData.getOrderCode();
        String transactionCode = webhookData.getCode();
        log.info("PayOS Webhook: Verified - orderCode={}, code={}", orderCode, transactionCode);

        // Bỏ qua webhook xác nhận URL (PayOS gửi khi đăng ký webhook URL, orderCode = 0)
        if (orderCode == 0) {
            log.info("PayOS Webhook: Confirm webhook URL - skipping");
            return;
        }

        // 3. Chỉ xử lý giao dịch thành công (code = "00")
        if (!"00".equals(transactionCode)) {
            log.info("PayOS Webhook: Transaction not successful - orderCode={}, code={}",
                    orderCode, transactionCode);

            // Cập nhật trạng thái CANCELLED nếu giao dịch thất bại
            Optional<PayosDeposit> depositOpt = payosDepositRepository.findByOrderCode(orderCode);
            depositOpt.ifPresent(deposit -> {
                if (deposit.getStatus() == PayosDeposit.DepositStatus.PENDING) {
                    deposit.setStatus(PayosDeposit.DepositStatus.CANCELLED);
                    payosDepositRepository.save(deposit);
                }
            });
            return;
        }

        // 4. Tìm đơn hàng theo orderCode
        Optional<PayosDeposit> depositOpt = payosDepositRepository.findByOrderCode(orderCode);
        if (depositOpt.isEmpty()) {
            log.warn("PayOS Webhook: Order not found - orderCode={}", orderCode);
            return;
        }
        PayosDeposit deposit = depositOpt.get();

        // 5. Kiểm tra trùng lặp (chống xử lý 2 lần)
        if (deposit.getStatus() != PayosDeposit.DepositStatus.PENDING) {
            log.info("PayOS Webhook: Order already processed - orderCode={}, status={}",
                    orderCode, deposit.getStatus());
            return;
        }

        // 6. Kiểm tra số tiền
        BigDecimal webhookAmount = BigDecimal.valueOf(webhookData.getAmount());
        if (deposit.getAmount().compareTo(webhookAmount) != 0) {
            log.warn("PayOS Webhook: Amount mismatch - orderCode={}, DB={}, webhook={}",
                    orderCode, deposit.getAmount(), webhookAmount);
            return;
        }

        // 7. Cập nhật trạng thái đơn hàng
        deposit.setStatus(PayosDeposit.DepositStatus.SUCCESS);
        deposit.setCompletedAt(LocalDateTime.now());
        payosDepositRepository.save(deposit);

        // 8. Cộng tiền vào ví (logic giống VNPay ipnHandler)
        User user = deposit.getUser();
        Wallet wallet = walletRepository.findByUser(user)
                .orElseGet(() -> {
                    log.info("PayOS Webhook: Auto-creating wallet for userId={}", user.getId());
                    Wallet newWallet = Wallet.builder().user(user).build();
                    return walletRepository.save(newWallet);
                });

        BigDecimal newBalance = wallet.getBalance().add(deposit.getAmount());
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        // 9. Ghi log WalletTransaction
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .type(WalletTransaction.TransactionType.deposit)
                .amount(deposit.getAmount())
                .balanceAfter(newBalance)
                .refType("payos_deposit")
                .refId(deposit.getId())
                .note("PayOS deposit - OrderCode: " + orderCode)
                .build();
        walletTransactionRepository.save(transaction);

        log.info("PayOS Webhook: SUCCESS - orderCode={}, amount={}, newBalance={}",
                orderCode, deposit.getAmount(), newBalance);
    }

    @Override
    public void confirmWebhook(String webhookUrl) throws Exception {
        log.info("PayOS: Confirming webhook URL - {}", webhookUrl);
        payOS.webhooks().confirm(webhookUrl);
        log.info("PayOS: Webhook URL confirmed successfully - {}", webhookUrl);
    }
}
