package com.swp391.horseracing.controller;


import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.request.LogoutRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.dto.response.LogoutResponse;
import com.swp391.horseracing.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)

public class AuthController {

    AuthService authService;


    @PostMapping("/login")
    ApiResponse<LoginResponse> login(@RequestBody LoginRequest request){
        var result = authService.login(request);

        return ApiResponse.success(result);
    }


    @PostMapping("/logout")
    ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {

        var result = authService.logout(request);
        return ApiResponse.success(result);
    }


}
