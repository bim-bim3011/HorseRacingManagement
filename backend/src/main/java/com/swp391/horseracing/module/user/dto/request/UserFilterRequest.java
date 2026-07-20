package com.swp391.horseracing.module.user.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserFilterRequest {
    String keyword;
    String status;
    Integer roleId;
    @Builder.Default
    int page = 0;
    @Builder.Default
    int size = 10;
}
