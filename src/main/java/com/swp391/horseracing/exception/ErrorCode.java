package com.swp391.horseracing.exception;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@AllArgsConstructor
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public enum ErrorCode {



    USER_NOT_FOUND(1005,"user not found ",HttpStatus.BAD_REQUEST),
    INVALID_KEY(1002,"invalid message key",HttpStatus.UNAUTHORIZED),
    INVALID_USERNAME(1003,"invalid username",HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004,"invalid password",HttpStatus.BAD_REQUEST),
    ACCESS_DENIED(1005,"you do not has permission",HttpStatus.FORBIDDEN),
    TEST_EXCEPTION(6789,"test exception with error code",HttpStatus.ACCEPTED),

    UNCATEGORIZED_EXCEPTION(9999,"uncategorized exception",HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001,"user existed",HttpStatus.CONFLICT),;



    int code;
    String message;
    HttpStatus status;
}
