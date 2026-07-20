package com.swp391.horseracing.module.common.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayosCreateRequest {

    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 2000, message = "Số tiền nạp tối thiểu là 2.000 VNĐ")
    private Integer amount;
}
