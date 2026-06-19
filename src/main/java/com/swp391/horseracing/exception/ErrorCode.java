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

     INACTIVE_ACCOUNT(1010,"your account is inactive",HttpStatus.UNAUTHORIZED),
     BANNED_ACCOUNT(1011,"your account is banned",HttpStatus.UNAUTHORIZED),

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
    HORSE_ALREADY_EXISTS(4011, "Horse already exists", HttpStatus.CONFLICT),
    NOT_HORSE_OWNER(4012, "User is not a horse owner", HttpStatus.FORBIDDEN),
    RACE_NOT_AVAILABLE(4012, "Race is not available for registration", HttpStatus.BAD_REQUEST),
    HORSE_NOT_ACTIVE(4013, "Horse is not approved yet", HttpStatus.BAD_REQUEST),
    HORSE_AGE_NOT_QUALIFIED(4014, "Horse age does not meet race requirements", HttpStatus.BAD_REQUEST),
    HORSE_ALREADY_REGISTERED(4015, "Horse already registered in this race", HttpStatus.CONFLICT),
    RACE_FULL(4016, "Race has reached maximum entries", HttpStatus.CONFLICT),
    TOURNAMENT_NOT_FOUND(4041, "Tournament not found", HttpStatus.NOT_FOUND),
    RACE_NOT_FOUND(4042, "Race not found", HttpStatus.NOT_FOUND),
    RACE_NOT_BELONG_TO_TOURNAMENT(4043, "Race does not belong to this tournament", HttpStatus.BAD_REQUEST),PENALTY_RULE_NOT_FOUND(4044, "Penalty rule not found", HttpStatus.NOT_FOUND),PENALTY_RULE_NOT_BELONG_TO_TOURNAMENT(4045, "Penalty rule does not belong to this tournament", HttpStatus.BAD_REQUEST),
    HORSE_NOT_FOUND(4046, "Horse not found", HttpStatus.NOT_FOUND),
    RACE_ENTRY_NOT_FOUND(4047, "Race entry not found", HttpStatus.NOT_FOUND),
    HORSE_MISSING_CERTIFICATE(4048, "Horse health certificate is missing", HttpStatus.BAD_REQUEST),
    ;



    int code;
    String message;
    HttpStatus status;
}
