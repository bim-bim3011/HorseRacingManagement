package com.swp391.horseracing.module.payment.service;

import com.swp391.horseracing.module.common.dto.response.VNPayResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {


    VNPayResponse createVnPayPayment(HttpServletRequest request);




    Map<String, String> ipnHandler(HttpServletRequest request);
}
