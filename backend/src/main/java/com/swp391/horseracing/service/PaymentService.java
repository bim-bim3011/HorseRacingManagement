package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.response.VNPayResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

public interface PaymentService {


    VNPayResponse createVnPayPayment(HttpServletRequest request);


    VNPayResponse callback(HttpServletRequest request);

    Map<String, String> ipnHandler(HttpServletRequest request);
}
