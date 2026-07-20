package com.swp391.horseracing.core.exception;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
public class AppException extends  RuntimeException {

            ErrorCode errorCode; // loai loi


}
