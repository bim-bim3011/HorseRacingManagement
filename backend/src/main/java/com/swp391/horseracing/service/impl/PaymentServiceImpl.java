package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.config.VNPayConfig;
import com.swp391.horseracing.dto.response.VNPayResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.VnpayDeposit;
import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.betting.WalletTransaction;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.repository.VnpayDepositRepository;
import com.swp391.horseracing.repository.WalletRepository;
import com.swp391.horseracing.repository.WalletTransactionRepository;
import com.swp391.horseracing.service.PaymentService;
import com.swp391.horseracing.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    VNPayConfig vnPayConfig;
    UserRepository userRepository;
    VnpayDepositRepository vnpayDepositRepository;
    WalletRepository walletRepository;
    WalletTransactionRepository walletTransactionRepository;

    @Override
    public VNPayResponse createVnPayPayment(HttpServletRequest request) {
        long amount = Integer.parseInt(request.getParameter("amount")) * 100L;
        String bankCode = request.getParameter("bankCode");

        Map<String, String> vnpParamsMap = vnPayConfig.getVNPayConfig();
        vnpParamsMap.put("vnp_Amount", String.valueOf(amount));
        if (bankCode != null && !bankCode.isEmpty()) {
            vnpParamsMap.put("vnp_BankCode", bankCode);
        }
        vnpParamsMap.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));

        // Lấy txnRef đã được sinh trong VNPayConfig
        String txnRef = vnpParamsMap.get("vnp_TxnRef");

        // Lấy User hiện tại từ SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Lưu hoá đơn nạp tiền (PENDING) xuống Database
        VnpayDeposit deposit = VnpayDeposit.builder()
                .user(user)
                .txnRef(txnRef)
                .amount(BigDecimal.valueOf(Integer.parseInt(request.getParameter("amount"))))
                .status(VnpayDeposit.DepositStatus.pending)
                .build();
        vnpayDepositRepository.save(deposit);
        log.info("Created VnpayDeposit: txnRef={}, amount={}, userId={}", txnRef, request.getParameter("amount"), user.getId());

        // Build query URL
        String queryUrl = VNPayUtil.getPaymentURL(vnpParamsMap, true);
        String hashData = VNPayUtil.getPaymentURL(vnpParamsMap, false);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        return VNPayResponse.builder()
                .code("ok")
                .message("success")
                .paymentUrl(paymentUrl)
                .build();
    }

    @Override
    public VNPayResponse callback(HttpServletRequest request) {
        String status = request.getParameter("vnp_ResponseCode");
        String check = "false";
        if (status.equals("00")) {
            check = "true";
        }
        return VNPayResponse.builder()
                .code(status)
                .message(check)
                .build();
    }

    @Override
    @Transactional
    public Map<String, String> ipnHandler(HttpServletRequest request) {
        Map<String, String> result = new HashMap<>();

        try {
            // === Chốt chặn 1: Verify SecureHash ===
            Map<String, String> fields = new TreeMap<>();
            for (java.util.Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnpSecureHash = fields.remove("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");

            // Băm lại toàn bộ params còn lại bằng secret key
            String hashData = VNPayUtil.getPaymentURL(fields, false);
            String computedHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);

            if (!computedHash.equalsIgnoreCase(vnpSecureHash)) {
                log.warn("IPN: Invalid checksum. Expected={}, Received={}", computedHash, vnpSecureHash);
                result.put("RspCode", "97");
                result.put("Message", "Invalid Checksum");
                return result;
            }

            // === Chốt chặn 2: Tìm hoá đơn theo txnRef ===
            String txnRef = fields.get("vnp_TxnRef");
            Optional<VnpayDeposit> depositOpt = vnpayDepositRepository.findByTxnRef(txnRef);
            if (depositOpt.isEmpty()) {
                log.warn("IPN: Order not found for txnRef={}", txnRef);
                result.put("RspCode", "01");
                result.put("Message", "Order not found");
                return result;
            }
            VnpayDeposit deposit = depositOpt.get();

            // === Chốt chặn 3: Kiểm tra số tiền ===
            long vnpAmount = Long.parseLong(fields.get("vnp_Amount"));
            long depositAmountInVnpFormat = deposit.getAmount().longValue() * 100;
            if (vnpAmount != depositAmountInVnpFormat) {
                log.warn("IPN: Invalid amount. DB={}, VNPAY={}", depositAmountInVnpFormat, vnpAmount);
                result.put("RspCode", "04");
                result.put("Message", "Invalid Amount");
                return result;
            }

            // === Chốt chặn 4: Kiểm tra trạng thái (chống duplicate) ===
            if (deposit.getStatus() != VnpayDeposit.DepositStatus.pending) {
                log.info("IPN: Order already confirmed. txnRef={}, status={}", txnRef, deposit.getStatus());
                result.put("RspCode", "02");
                result.put("Message", "Order already confirmed");
                return result;
            }

            // === Chốt chặn 5: Xử lý kết quả giao dịch ===
            String responseCode = fields.get("vnp_ResponseCode");

            // Lưu raw callback data để đối soát
            deposit.setRawCallback(new HashMap<>(fields));
            deposit.setVnpTransactionNo(fields.get("vnp_TransactionNo"));
            deposit.setVnpBankCode(fields.get("vnp_BankCode"));
            deposit.setVnpPayDate(fields.get("vnp_PayDate"));

            if ("00".equals(responseCode)) {
                // === THÀNH CÔNG: Cộng tiền vào ví ===
                deposit.setStatus(VnpayDeposit.DepositStatus.success);
                deposit.setCompletedAt(LocalDateTime.now());

                User user = deposit.getUser();
                Wallet wallet = walletRepository.findByUser(user)
                        .orElseGet(() -> {
                            // Auto-create wallet cho User cũ chưa có ví
                            log.info("IPN: Auto-creating wallet for userId={}", user.getId());
                            Wallet newWallet = Wallet.builder().user(user).build();
                            return walletRepository.save(newWallet);
                        });

                // Cộng tiền
                BigDecimal newBalance = wallet.getBalance().add(deposit.getAmount());
                wallet.setBalance(newBalance);
                walletRepository.save(wallet);

                // Ghi log WalletTransaction
                WalletTransaction transaction = WalletTransaction.builder()
                        .wallet(wallet)
                        .type(WalletTransaction.TransactionType.deposit)
                        .amount(deposit.getAmount())
                        .balanceAfter(newBalance)
                        .refType("vnpay_deposit")
                        .refId(deposit.getId())
                        .note("VNPAY deposit - TxnRef: " + txnRef)
                        .build();
                walletTransactionRepository.save(transaction);

                log.info("IPN: SUCCESS. txnRef={}, amount={}, newBalance={}", txnRef, deposit.getAmount(), newBalance);
            } else {
                // === THẤT BẠI ===
                deposit.setStatus(VnpayDeposit.DepositStatus.failed);
                log.info("IPN: FAILED. txnRef={}, responseCode={}", txnRef, responseCode);
            }

            vnpayDepositRepository.save(deposit);

            result.put("RspCode", "00");
            result.put("Message", "Confirm Success");
            return result;

        } catch (Exception e) {
            log.error("IPN: Unexpected error", e);
            result.put("RspCode", "99");
            result.put("Message", "Unknown error");
            return result;
        }
    }
}
