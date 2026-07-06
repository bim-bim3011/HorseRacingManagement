package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.response.VNPayResponse;
import com.swp391.horseracing.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    @GetMapping("/vn-pay")
    ApiResponse<VNPayResponse> pay(HttpServletRequest request) {
        return ApiResponse.success(paymentService.createVnPayPayment(request));
    }

    @GetMapping("/vn-pay-callback")
    public ApiResponse<VNPayResponse> callBackHandler(HttpServletRequest request) {
        return ApiResponse.success(paymentService.callback(request));
    }

    /**
     * IPN URL - VNPAY gọi ngầm Server-to-Server.
     * Trả về Map thay vì ApiResponse vì VNPAY yêu cầu format cứng: {"RspCode":"00","Message":"..."}
     */
    @GetMapping("/vn-pay-ipn")
    public Map<String, String> ipnHandler(HttpServletRequest request) {
        return paymentService.ipnHandler(request);
    }
}
