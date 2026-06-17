package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class HorseResponse {
    private Integer id;
    private String name;
    private String breed;
    private Integer age;
    private String healthStatus;
    private String healthCertificateUrl;
    private String status;
    private String ownerName;
}
