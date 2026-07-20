package com.swp391.horseracing.module.auth.controller;


import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.module.common.dto.request.LoginRequest;
import com.swp391.horseracing.module.common.dto.request.LogoutRequest;
import com.swp391.horseracing.module.common.dto.request.RefreshRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.auth.dto.response.AuthenticationResponse;
import com.swp391.horseracing.module.common.dto.response.LogoutResponse;
import com.swp391.horseracing.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
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
        
        setRefreshTokenCookie(response, result.getRefreshToken(), 7 * 24 * 60 * 60);

        return ApiResponse.success(result);
    }



    @Operation(
            summary = "Logout user",
            description = "persist AccessToken into black-list token"
    )
    @PostMapping("/logout")
    ApiResponse<LogoutResponse> logout(@RequestBody LogoutRequest request, HttpServletResponse response) throws ParseException, JOSEException {

        var result = authService.LogoutUsingRedis(request);
        
        setRefreshTokenCookie(response, "", 0);
        
        return ApiResponse.success(result);
    }

    

    @Operation(
            summary = "get new AccessToken ",
            description = "provide refresh token to get new access token"
    )
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@CookieValue(name = "refreshToken") String refreshToken, HttpServletResponse response) throws ParseException, JOSEException {
       RefreshRequest request = new RefreshRequest(refreshToken);
       var result = authService.refreshToken(request);
       
       setRefreshTokenCookie(response, result.getRefreshToken(), 7 * 24 * 60 * 60);
       
       return ApiResponse.success(result);
    }
    @Operation(
            summary = "Admin Login",
            description = "Authenticate user and verify ADMIN role. Returns tokens only for admin users."
    )
    @PostMapping("/admin/login")
    ApiResponse<AuthenticationResponse> adminLogin(@RequestBody LoginRequest request, HttpServletResponse response){
        var result = authService.adminLogin(request);

        setRefreshTokenCookie(response, result.getRefreshToken(), 7 * 24 * 60 * 60);

        return ApiResponse.success(result);
    }

    @PostMapping("/outbound/authentication")
    ApiResponse<AuthenticationResponse> outboundAuthenticate(
            @RequestParam("code") String code,
            HttpServletResponse response
    ){
        var result = authService.outboundAuthenticate(code);

            setRefreshTokenCookie(response, result.getRefreshToken(), 7 * 24 * 60 * 60);

        return ApiResponse.success(result);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken, int maxAge) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Đổi thành false khi dev local (HTTP)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax") // Đổi thành Lax vì frontend dùng proxy nên được tính là cùng origin
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
