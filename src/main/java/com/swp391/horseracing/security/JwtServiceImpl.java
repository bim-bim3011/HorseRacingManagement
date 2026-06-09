package com.swp391.horseracing.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
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
import java.time.temporal.ChronoUnit;
import java.util.Date;

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
    public String generateAccessToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.ES512);


        Date issueTime = new Date();
        Date expirationTime = Date.from(issueTime.toInstant().plus(30, ChronoUnit.MINUTES));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(issueTime.toString())
                .expirationTime(expirationTime)
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(header, payload);


        try {
            jwsObject.sign(new MACSigner(secret));
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }

        return jwsObject.serialize();
    }

    @Override
    public String generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.ES512);


        Date issueTime = new Date();
        Date expirationTime = new Date(issueTime.getTime() + Long.parseLong(expiration));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer(issueTime.toString())
                .expirationTime(expirationTime)
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(header, payload);


        try {
            jwsObject.sign(new MACSigner(secret));
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }

        return jwsObject.serialize();
    }


    private void buildScope(){

    }
}
