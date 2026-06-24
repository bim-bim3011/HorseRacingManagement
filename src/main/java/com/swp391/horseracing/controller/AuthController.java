package com.swp391.horseracing.controller;


import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.request.LogoutRequest;
import com.swp391.horseracing.dto.request.RefreshRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.AuthenticationResponse;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.dto.response.LogoutResponse;
import com.swp391.horseracing.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name= "authentication",description= "login and logout account")
public class AuthController {

    AuthService authService;

    @Operation(
            summary = "Authenticate User",
            description = "check valid user and generate Access Token, Refresh Token"
    )
    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> login(@RequestBody LoginRequest request){
        var result = authService.login(request);

        return ApiResponse.success(result);
    }



    @Operation(
            summary = "Logout user",
            description = "persist AccessToken into black-list token"
    )
    @PostMapping("/logout")
    ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {

        var result = authService.logout(request);
        return ApiResponse.success(result);
    }

    

    @Operation(
            summary = "get new AccessToken ",
            description = "provide refresh token to get new access token"
    )
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
       var result = authService.refreshToken(request);
        return ApiResponse.success(result);
    }



}
