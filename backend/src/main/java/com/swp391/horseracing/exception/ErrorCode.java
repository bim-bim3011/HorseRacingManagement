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




    //tournament
    TOURNAMENT_START_DATE_IN_PAST(4068, "Start date cannot be in the past", HttpStatus.BAD_REQUEST),
    TOURNAMENT_INVALID_DATE_RANGE(4069, "End date must be after start date", HttpStatus.BAD_REQUEST),
    TOURNAMENT_DATE_OVERLAP(4070, "Tournament date range overlaps with an existing tournament", HttpStatus.CONFLICT),
    TOURNAMENT_MISSING_PENALTY_RULES(4007, "Tournament missing penalty rules", HttpStatus.BAD_REQUEST),
    TOURNAMENT_MISSING_STANDARDS(4009, "Tournament missing standards", HttpStatus.BAD_REQUEST),

    //race
    TOURNAMENT_MISSING_MAX_ENTRIES(4067, "Tournament missing max main entries", HttpStatus.BAD_REQUEST),
    RACE_MISSING_STANDARDS(4009, "Race missing standards", HttpStatus.BAD_REQUEST),
    RACE_MISSING_REFEREES(4064, "Race must have at least 1 referee assigned before activation", HttpStatus.BAD_REQUEST),

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
    ENTRY_IS_NOT_MAIN(4073, "Entry is already a reserve, cannot be replaced", HttpStatus.BAD_REQUEST),
    NO_RESERVE_AVAILABLE(4074, "No reserve horse available to replace", HttpStatus.BAD_REQUEST),
    //jokeyinvation
    JOCKEY_NOT_FOUND(4049, "Jockey not found", HttpStatus.NOT_FOUND),
    JOCKEY_NOT_APPROVED(4050, "Jockey is not approved yet", HttpStatus.BAD_REQUEST),
    HORSE_ALREADY_HAS_JOCKEY(4051, "Horse already has an accepted jockey in this race", HttpStatus.CONFLICT),
    INVITATION_ALREADY_EXISTS(4052, "Invitation already sent to this jockey", HttpStatus.CONFLICT),
    JOCKEY_ALREADY_ASSIGNED(4053, "Jockey already assigned to another horse in this race", HttpStatus.CONFLICT),
    INVITATION_NOT_FOUND(4054, "Invitation not found", HttpStatus.NOT_FOUND),
    NOT_JOCKEY(4056, "User is not a jockey", HttpStatus.FORBIDDEN),HORSE_ENTRY_NOT_APPROVED(4057, "Horse entry is not approved yet by admin", HttpStatus.BAD_REQUEST),
    //referee
    REFEREE_NOT_FOUND(4058, "Referee not found", HttpStatus.NOT_FOUND),
    REFEREE_NOT_ACTIVE(4059, "Referee is not active", HttpStatus.BAD_REQUEST),
    REFEREE_ALREADY_ASSIGNED_TO_RACE(4060, "Referee already assigned to this race", HttpStatus.CONFLICT),
    REFEREE_ASSIGNMENT_NOT_FOUND(4061, "Referee assignment not found", HttpStatus.NOT_FOUND),
    DUPLICATE_LICENSE_NUMBER(4062, "License number already exists", HttpStatus.CONFLICT),
    JOCKEY_PROFILE_INCOMPLETE(4063, "Jockey profile is incomplete for approval", HttpStatus.BAD_REQUEST),
    FIRST_ROUND_NOT_FOUND(4072, "First round race not found for this tournament", HttpStatus.NOT_FOUND),
    HORSE_BREED_NOT_QUALIFIED(4065, "Horse breed does not match tournament requirement", HttpStatus.BAD_REQUEST),
    INVALID_USER_STATUS(1013, "Invalid user status", HttpStatus.BAD_REQUEST),
    ;







    int code;
    String message;
    HttpStatus status;
}
