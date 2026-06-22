package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefereeAssignmentResponse {
    private Integer id;
    private Integer raceId;
    private String raceName;
    private Integer refereeId;
    private String refereeName;
    private String refereeEmail;
    private String licenseNumber;
}
