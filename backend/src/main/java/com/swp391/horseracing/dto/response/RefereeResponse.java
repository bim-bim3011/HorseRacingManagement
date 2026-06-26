package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RefereeResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String licenseNumber;
    private String status;
}
