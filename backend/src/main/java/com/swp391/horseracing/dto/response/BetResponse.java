package com.swp391.horseracing.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class BetResponse {
    private Integer id;
    private String horseName;
    private String raceName;
    private String betType;
    private BigDecimal amount;
    private BigDecimal oddsSnapshot;
    private BigDecimal potentialPayout;
    private BigDecimal actualPayout;
    private String status;
    private LocalDateTime placedAt;
    private LocalDateTime settledAt;
}
