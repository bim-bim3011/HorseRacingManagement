package com.swp391.horseracing.dto.response;


import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class VNPayResponse {
    public String code;
    public String message;
    public String paymentUrl;
}
