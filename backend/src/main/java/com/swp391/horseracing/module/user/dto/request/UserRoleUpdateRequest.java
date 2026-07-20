package com.swp391.horseracing.module.user.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRoleUpdateRequest {
    @NotEmpty(message = "Role IDs cannot be empty")
    Set<Integer> roleIds;
}
