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
import org.springframework.web.bind.annotation.CookieValue;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

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
    ApiResponse<AuthenticationResponse> login(@RequestBody LoginRequest request, HttpServletResponse response){
        var result = authService.login(request);
        
        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(cookie);

        return ApiResponse.success(result);
    }



    @Operation(
            summary = "Logout user",
            description = "persist AccessToken into black-list token"
    )
    @PostMapping("/logout")
    ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest request, HttpServletResponse response) throws ParseException, JOSEException {

        var result = authService.LogoutUsingRedis(request);
        
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return ApiResponse.success(result);
    }

    

    @Operation(
            summary = "get new AccessToken ",
            description = "provide refresh token to get new access token"
    )
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@CookieValue(name = "refreshToken") String refreshToken) throws ParseException, JOSEException {
       RefreshRequest request = new RefreshRequest(refreshToken);
       var result = authService.refreshToken(request);
        return ApiResponse.success(result);
    }
    @Operation(
            summary = "Admin Login",
            description = "Authenticate user and verify ADMIN role. Returns tokens only for admin users."
    )
    @PostMapping("/admin/login")
    ApiResponse<AuthenticationResponse> adminLogin(@RequestBody LoginRequest request, HttpServletResponse response){
        var result = authService.adminLogin(request);

        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ApiResponse.success(result);
    }



}
