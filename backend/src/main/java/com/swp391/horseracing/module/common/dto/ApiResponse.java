package com.swp391.horseracing.module.common.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import com.swp391.horseracing.core.exception.ErrorCode;
import lombok.*;
import lombok.experimental.FieldDefaults;



@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class ApiResponse<T> {

    @Builder.Default
    int code =1000;

    String message;
    T result;



    public static <T> ApiResponse<T> success(T result) {
        return  ApiResponse.<T>builder()
                .result(result)
                .build();
    }

    public static <T> ApiResponse<T> error(T result,String message) {
        return ApiResponse.<T>builder()
                .result(result)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode code,String message) {
        return ApiResponse.<T>builder()
                .code(code.getCode())
                .message(message)
                .build();
    }

}
