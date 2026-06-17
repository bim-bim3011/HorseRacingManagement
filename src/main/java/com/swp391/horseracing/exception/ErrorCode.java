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



    UNAUTHENTICATED(1006,"test exception with error code",HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1005,"user not found ",HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1007,"role not found exception",HttpStatus.BAD_REQUEST),
    INVALID_KEY(1002,"invalid message key",HttpStatus.UNAUTHORIZED),

    INVALID_USERNAME(1003,"invalid username",HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004,"invalid password",HttpStatus.BAD_REQUEST),

    DUPLICATE_USERNAME(1008,"username already exists",HttpStatus.BAD_REQUEST),
    DUPLICATE_EMAIL(1009,"email already exists",HttpStatus.BAD_REQUEST),

    ACCESS_DENIED(1005,"you do not has permission",HttpStatus.FORBIDDEN),
    TEST_EXCEPTION(6789,"test exception with error code",HttpStatus.ACCEPTED),
    EMAIL_EXISTED(1008,"email is existed",HttpStatus.CONFLICT),
    UNCATEGORIZED_EXCEPTION(9999,"uncategorized exception",HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001,"user existed",HttpStatus.CONFLICT),
    CLOUDINARY_UPLOAD_FAILED(2001, "upload image failed", HttpStatus.INTERNAL_SERVER_ERROR),
    CLOUDINARY_DELETE_FAILED(2002, "delete image failed", HttpStatus.INTERNAL_SERVER_ERROR),
    NOT_FOUND(4040, "Not found", HttpStatus.NOT_FOUND),
    RACE_MISSING_STANDARDS(4009, "Race missing standards", HttpStatus.BAD_REQUEST),
    TOURNAMENT_MISSING_REGULATIONS(4006, "Tournament missing regulations", HttpStatus.BAD_REQUEST),
    TOURNAMENT_MISSING_PENALTY_RULES(4007, "Tournament missing penalty rules", HttpStatus.BAD_REQUEST),
    TOURNAMENT_ALREADY_EXISTS(4005, "A tournament is already active", HttpStatus.CONFLICT),
    ;



    int code;
    String message;
    HttpStatus status;
}
