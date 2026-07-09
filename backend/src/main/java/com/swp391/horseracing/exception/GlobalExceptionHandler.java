package com.swp391.horseracing.exception;

import com.swp391.horseracing.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.List;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {


    // RunTime exception
    @ExceptionHandler(value = { AppException.class })
    public ResponseEntity<ErrorResponse> handleException(AppException exception, WebRequest request) {
        ErrorResponse response = ErrorResponse.builder()
                .code(exception.getErrorCode().getCode())
                .error(exception.getErrorCode().getStatus().getReasonPhrase())
                .message(exception.getErrorCode().getMessage())
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity
                .status(exception.getErrorCode().getStatus())
                .body(response);
    }



    // exception validate dto request
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e, WebRequest request) {

        BindingResult bindingResult = e.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();

        // Lấy tất cả error messages
        List<String> errors = fieldErrors.stream()
                .map(FieldError::getDefaultMessage)
                .toList();

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .code(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(errors.size() > 1 ? errors.toString() : errors.get(0))
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }


    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleException(AccessDeniedException exception) {

        ErrorCode errorCode = ErrorCode.ACCESS_DENIED;
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.status(errorCode.getStatus().value()).body(apiResponse);
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception, WebRequest request) {

//        ErrorResponse response = buildErrorCodeResponse(
//                ErrorCode.DATA_INTEGRITY_VIOLATION, request);

        ErrorResponse response = ErrorResponse.builder()
                .timestamp(new Date())
                .path(request.getDescription(false).replace("uri=", ""))
                .message(exception.getMessage())
                .build();

        return ResponseEntity.badRequest().body(response);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAllExceptions(
            Exception ex, WebRequest request) {

        log.error("Unexpected exception occurred: ", ex);
        ErrorResponse response = buildErrorCodeResponse(ErrorCode.UNCATEGORIZED_EXCEPTION, request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }


    private ErrorResponse buildErrorCodeResponse(ErrorCode errorCode, WebRequest request) {
        return ErrorResponse.builder()
                .timestamp(new Date())
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .error(errorCode.getStatus().getReasonPhrase())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();
    }

    //
}
