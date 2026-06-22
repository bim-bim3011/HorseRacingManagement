package com.swp391.horseracing.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class UpdateJockeyProfileRequest {
    private String username;
    private String fullName;
    private Integer experience_year;
    private Float weight;
    private MultipartFile file;
}
