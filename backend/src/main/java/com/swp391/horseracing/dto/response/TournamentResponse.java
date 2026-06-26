package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class TournamentResponse {
    private Integer id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String regulations;
}
