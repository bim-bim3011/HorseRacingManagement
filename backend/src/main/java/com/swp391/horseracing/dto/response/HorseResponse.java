package com.swp391.horseracing.dto.response;

import lombok.Builder;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@Builder
public class HorseResponse {
    private Integer id;
    private String name;
    private String breed;
    private String horseCode;
    private String gender;
    private LocalDate dateOfBirth;
    private Double height;
    private Double weight;
    private String healthStatus;
    private String healthCertificateUrl;
    private String status;
    private String ownerName;
}
