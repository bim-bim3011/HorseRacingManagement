package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.request.PayosCreateRequest;
import com.swp391.horseracing.dto.response.PayosCreateResponse;
import com.swp391.horseracing.dto.response.VNPayResponse;
import com.swp391.horseracing.service.PaymentService;
import com.swp391.horseracing.service.PayosService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentController {

    PaymentService paymentService;
    PayosService payosService;


    @GetMapping("/vn-pay")
    ApiResponse<VNPayResponse> pay(HttpServletRequest request) {
        return ApiResponse.success(paymentService.createVnPayPayment(request));
    }

    @GetMapping("/vn-pay-callback")
    public ApiResponse<VNPayResponse> callBackHandler(HttpServletRequest request) {
        return ApiResponse.success(paymentService.callback(request));
    }


    @GetMapping("/vn-pay-ipn")
    public Map<String, String> ipnHandler(HttpServletRequest request) {
        return paymentService.ipnHandler(request);
    }

    // ==================== PAYOS ENDPOINTS  ====================


    @PostMapping("/payos/create")
    public ApiResponse<PayosCreateResponse> createPayosPayment(
            @RequestBody @Valid PayosCreateRequest request) {
        return ApiResponse.success(payosService.createPaymentLink(request));
    }


    @PostMapping("/payos/webhook")
    public ResponseEntity<Void> payosWebhookHandler(@RequestBody String jsonBody) {
        try {
            payosService.handleWebhook(jsonBody);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("PayOS Webhook: Error processing webhook", e);
            // Vẫn trả 200 để PayOS không retry liên tục
            return ResponseEntity.ok().build();
        }
    }


    @GetMapping("/payos/return")
    public ResponseEntity<Void> payosReturnHandler(
            @RequestParam(required = false) String orderCode,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "false") String cancelled) {

        String frontendUrl;
        if ("true".equals(cancelled)) {
            frontendUrl = "http://localhost:5173/deposit-result?status=cancelled";
        } else {
            frontendUrl = "http://localhost:5173/deposit-result?status=" +
                    (status != null ? status : "unknown") +
                    "&orderCode=" + (orderCode != null ? orderCode : "");
        }

        return ResponseEntity.status(302)
                .header("Location", frontendUrl)
                .build();
    }

    /**
     * API đăng ký Webhook URL với PayOS (chỉ cần gọi 1 lần duy nhất).
     * Sau khi gọi thành công, PayOS sẽ tự động gửi webhook đến URL này mỗi khi có giao dịch.
     * Ví dụ: POST /api/payment/payos/confirm-webhook?url=https://xxxx.ngrok-free.app/api/payment/payos/webhook
     */
    @PostMapping("/payos/confirm-webhook")
    public ResponseEntity<String> confirmWebhook(@RequestParam String url) {
        try {
            payosService.confirmWebhook(url);
            return ResponseEntity.ok("Webhook URL đã được đăng ký thành công: " + url);
        } catch (Exception e) {
            log.error("PayOS: Failed to confirm webhook", e);
            return ResponseEntity.internalServerError()
                    .body("Lỗi đăng ký webhook: " + e.getMessage());
        }
    }
}
