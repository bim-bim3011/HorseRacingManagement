package com.swp391.horseracing.module.user.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import com.swp391.horseracing.module.user.entity.User.UserStatus;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserStatusUpdateRequest {
    @NotNull(message = "Status is required")
    UserStatus status;
}
