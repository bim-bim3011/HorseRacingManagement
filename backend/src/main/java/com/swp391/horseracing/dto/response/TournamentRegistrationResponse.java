package com.swp391.horseracing.dto.response;


import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TournamentRegistrationResponse {
    private Integer id;
    private String tournamentName;
    private Integer horseId;
    private String horseName;
    private String status;
    private String paymentStatus;
    private Boolean isReserve;
    private Integer reserveOrder;
}
