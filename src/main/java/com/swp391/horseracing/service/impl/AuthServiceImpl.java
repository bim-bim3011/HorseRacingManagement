package com.swp391.horseracing.service.impl;



import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.security.JwtService;
import com.swp391.horseracing.service.AuthService;
import com.swp391.horseracing.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class AuthServiceImpl implements AuthService {

    JwtService jwtService;
    UserService userService;

    AuthenticationManager authenticationManager;
    PasswordEncoder passwordEncoder;


    public LoginResponse login (LoginRequest request){

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(token);


        // tra ve token
        //


        return LoginResponse.builder()
                .accessToken("accessToken")
                .refreshToken("refreshToken")
                .build();
    }


}
