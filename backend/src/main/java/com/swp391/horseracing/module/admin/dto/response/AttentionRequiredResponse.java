package com.swp391.horseracing.module.admin.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttentionRequiredResponse {
    String id;
    String type;
    String action;
    String subject;
    String status;
    LocalDateTime createdAt;
}
