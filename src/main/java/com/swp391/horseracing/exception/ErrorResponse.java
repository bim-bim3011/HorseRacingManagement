package com.swp391.horseracing.exception;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Date;


@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ErrorResponse implements Serializable {

    int code;
    String message;
    String error;
    String path;
    Date timestamp;

}
