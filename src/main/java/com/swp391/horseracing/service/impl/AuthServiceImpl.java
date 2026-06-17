package com.swp391.horseracing.service.impl;



import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.request.LogoutRequest;
import com.swp391.horseracing.dto.request.RefreshRequest;
import com.swp391.horseracing.dto.response.AuthenticationResponse;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.dto.response.LogoutResponse;
import com.swp391.horseracing.entity.InvalidatedToken;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.InvalidatedTokenRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.security.JwtService;
import com.swp391.horseracing.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class AuthServiceImpl implements AuthService {

    JwtService jwtService;
    AuthenticationManager authenticationManager;
    InvalidatedTokenRepository invalidatedTokenRepository;
    private final UserRepository userRepository;


    @Override
    public AuthenticationResponse login (LoginRequest request){

        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(token);



        User user = (User) authentication.getPrincipal();

        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);


        return AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }


    @Override
    public LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException {
         var signToken = jwtService.verifyToken(request.getToken());

         String jit = signToken.getJWTClaimsSet().getJWTID();
         Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

         InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .tokenId(jit)
                .expiryDate(expiryTime)
                .build();

         invalidatedTokenRepository.save(invalidatedToken);


         return LogoutResponse.builder()
                 .success(true)
                 .build();
    }

    @Override
    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {

        SignedJWT signedJWT = jwtService.verifyToken(request.getToken());

        String category = signedJWT.getJWTClaimsSet().getStringClaim("category");

        if (!"refresh".equals(category)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String username = signedJWT.getJWTClaimsSet().getSubject();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        String newAccessToken = jwtService.generateAccessToken(user);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getToken())
                .authenticated(true)
                .build();

    }
}
