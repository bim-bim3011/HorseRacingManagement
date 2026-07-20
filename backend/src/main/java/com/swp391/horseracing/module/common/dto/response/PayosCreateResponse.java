package com.swp391.horseracing.module.common.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PayosCreateResponse {

    private String checkoutUrl;
    private Long orderCode;
}
