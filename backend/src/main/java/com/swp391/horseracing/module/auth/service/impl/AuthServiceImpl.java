package com.swp391.horseracing.module.auth.service.impl;



import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.horseracing.module.auth.dto.ExchangeTokenRequest;
import com.swp391.horseracing.module.common.dto.JwtInfo;
import com.swp391.horseracing.module.common.dto.request.LoginRequest;
import com.swp391.horseracing.module.common.dto.request.LogoutRequest;
import com.swp391.horseracing.module.common.dto.request.RefreshRequest;
import com.swp391.horseracing.module.auth.dto.response.AuthenticationResponse;
import com.swp391.horseracing.module.common.dto.response.LoginResponse;
import com.swp391.horseracing.module.common.dto.response.LogoutResponse;
import com.swp391.horseracing.module.auth.entity.InvalidatedToken;
import com.swp391.horseracing.module.auth.entity.RedisToken;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.auth.repository.InvalidatedTokenRepository;
import com.swp391.horseracing.module.auth.repository.RedisTokenRepository;
import com.swp391.horseracing.module.common.repository.RoleRepository;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.common.repository.httpclient.OutBoundIdentityClient;
import com.swp391.horseracing.module.user.repository.httpclient.OutBoundUserClient;
import com.swp391.horseracing.core.security.JwtService;
import com.swp391.horseracing.module.auth.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class AuthServiceImpl implements AuthService {

    JwtService jwtService;
    AuthenticationManager authenticationManager;
    InvalidatedTokenRepository invalidatedTokenRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;


    RedisTokenRepository redisTokenRepository;

    @Override
    public AuthenticationResponse login (LoginRequest request){

        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(token);



        User user = (User) authentication.getPrincipal();

        if(user.getStatus().equals(User.UserStatus.inactive)) {
            throw new AppException(ErrorCode.INACTIVE_ACCOUNT);
        }else if(user.getStatus().equals(User.UserStatus.banned)) {
            throw new AppException(ErrorCode.BANNED_ACCOUNT);
        }

        var accessPayload = jwtService.generateAccessToken(user);
        var refreshPayload = jwtService.generateRefreshToken(user);




        return AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessPayload.getToken())
                .refreshToken(refreshPayload.getToken())
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

        String newAccessToken = jwtService.generateAccessToken(user).getToken();

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getToken())
                .authenticated(true)
                .build();

    }



    public LogoutResponse LogoutUsingRedis(LogoutRequest request) throws ParseException {
        JwtInfo jwtInfo = jwtService.parseToken(request.getToken());
        String jwtId = jwtInfo.getJwtId();
        Date issueTime = jwtInfo.getIssueTime();
        Date expiryTime = jwtInfo.getExpirationTime();

        RedisToken redisToken;
        if(!expiryTime.before(new Date())) {
            Long ttlseconds = (expiryTime.getTime() - System.currentTimeMillis())/1000;
             redisToken = RedisToken
                    .builder()
                    .jwtId(jwtId)
                    .expiredTime(ttlseconds)
                    .build();
            redisTokenRepository.save(redisToken);
            log.info("invalidated Token is saved in redis with issueTime{} and expiryTime{}",
                    issueTime, expiryTime);
        }

        return LogoutResponse.builder()
                .success(true)
                .build();
    }


    OutBoundIdentityClient outBoundIdentityClient;
    OutBoundUserClient outboundUserClient;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    String CLIENT_ID;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    String CLIENT_SECRET;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    String REDIRECT_URI;



    @Override
    public AuthenticationResponse outboundAuthenticate(String code) {

        var response = outBoundIdentityClient.exchangeToken(ExchangeTokenRequest
                .builder()
                        .code(code)
                        .clientId(CLIENT_ID)
                        .clientSecret(CLIENT_SECRET)
                        .redirectUri(REDIRECT_URI)
                        .grantType("authorization_code")
                .build());


        String refreshToken = response.getRefreshToken();
        log.info("refreshToken is {}", refreshToken);
        var userInfo = outboundUserClient.getUserInfo("json",response.getAccessToken());

        log.info("userInfo:{}",userInfo);



        var user = userRepository.findByEmail(userInfo.getEmail());
        if (user == null) {
            user = userRepository.save(User.builder()
                            .email(userInfo.getEmail())
                            .status(User.UserStatus.active)
                            .username(userInfo.getEmail())
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .roles(new HashSet<>(Set.of(
                                    roleRepository.findByRoleName("SPECTATOR").orElseThrow(
                                            ()-> new AppException(ErrorCode.ROLE_NOT_FOUND)
                                    )
                            )))
                    .build());
        }

        var accessType = jwtService.generateAccessToken(user);
        var refreshType = jwtService.generateRefreshToken(user);

        return AuthenticationResponse
                .builder()
                .authenticated(true)
                .accessToken(accessType.getToken())
                .refreshToken(refreshType.getToken())
                .build();
    }

    @Override
    public AuthenticationResponse adminLogin(LoginRequest request) {
        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword());
        Authentication authentication = authenticationManager.authenticate(token);

        User user = (User) authentication.getPrincipal();

        if (user.getStatus().equals(User.UserStatus.inactive)) {
            throw new AppException(ErrorCode.INACTIVE_ACCOUNT);
        } else if (user.getStatus().equals(User.UserStatus.banned)) {
            throw new AppException(ErrorCode.BANNED_ACCOUNT);
        }

        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getRoleName()));
        if (!isAdmin) {
            throw new AppException(ErrorCode.ADMIN_ACCESS_ONLY);
        }

        var accessPayload = jwtService.generateAccessToken(user);
        var refreshPayload = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessPayload.getToken())
                .refreshToken(refreshPayload.getToken())
                .build();
    }
}
