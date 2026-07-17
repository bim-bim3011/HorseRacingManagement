package com.swp391.horseracing.module.jockey.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JockeyInvitationResponse {
    private Integer id;
    private String raceName;
    private String horseName;
    private String jockeyName;
    private String status;
}
