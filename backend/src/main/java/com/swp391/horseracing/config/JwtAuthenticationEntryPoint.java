package com.swp391.horseracing.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.exception.ErrorCode;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;

        response.setStatus(errorCode.getStatus().value());
        response.setContentType("application/json");  // kieu  du lieu can tra ve
        String message = errorCode.getMessage();
        ApiResponse<?> apiResponse= ApiResponse.error(errorCode,message);


        ObjectMapper mapper =  new ObjectMapper();
        response.getWriter().println(mapper.writeValueAsString(apiResponse));
        response.flushBuffer();

    }
}
