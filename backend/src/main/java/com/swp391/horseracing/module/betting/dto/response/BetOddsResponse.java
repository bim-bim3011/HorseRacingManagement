package com.swp391.horseracing.module.betting.dto.response;


import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class BetOddsResponse {

    private Integer entryId;
    private String horseName;
    private String betType;
    private BigDecimal odds;
}
