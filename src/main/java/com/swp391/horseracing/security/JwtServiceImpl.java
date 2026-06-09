package com.swp391.horseracing.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jwt.JWTClaimsSet;
import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {



    @Value("{${jwt.signerKey}")
    String secret;

    @Value("${jwt.expiration}")
    String expiration;

    @Override
    public boolean isTokenValid(String token) {
        return false;
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest introspectRequest) {
        return null;
    }

    @Override
    public String generateToken(User user) {
        return "";
    }
}
