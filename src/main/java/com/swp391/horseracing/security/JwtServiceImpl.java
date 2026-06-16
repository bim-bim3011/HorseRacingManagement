package com.swp391.horseracing.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.InvalidatedTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class JwtServiceImpl implements JwtService {

    final InvalidatedTokenRepository invalidatedTokenRepository;

    @Value("{${jwt.signerKey}")
    String secret;

    @Value("${jwt.expiration}")
    String expiration;


    @Override
    public IntrospectResponse introspect(IntrospectRequest introspectRequest) throws ParseException, JOSEException {
        var token = introspectRequest.getToken();

        boolean check = true;

        try {
            verifyToken(token);
        }catch (Exception e) {
            check =false;
        }



        return IntrospectResponse.builder()
                .isValid(check)
                .build();
    }

    @Override
    public String generateAccessToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);


        Date issueTime = new Date();
        Date expirationTime = Date.from(issueTime.toInstant().plus(30, ChronoUnit.MINUTES));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("elite-derby-platform")
                .issueTime(issueTime)
                .expirationTime(expirationTime)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope",buildScope(user))
                .claim("category","access")
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
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);


        Date issueTime = new Date();
        Date expirationTime = new Date(issueTime.getTime() + Long.parseLong(expiration));

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issueTime(issueTime)
                .expirationTime(expirationTime)
                .claim("category","refresh")
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


    private String buildScope(User user){
       StringJoiner scope = new StringJoiner(" ");


       if(!user.getRoles().isEmpty()){
           for(Role role : user.getRoles()){
               scope.add("ROLE_"+role.getRoleName());
           }

       }
       return scope.toString();
    }


    @Override
    public SignedJWT verifyToken(String token) throws ParseException, JOSEException {

           JWSVerifier verifier = new MACVerifier(secret.getBytes());
           SignedJWT jwt = SignedJWT.parse(token);
           Date expirationTime = jwt.getJWTClaimsSet().getExpirationTime();

           var ischange = jwt.verify(verifier);

        if(!ischange && expirationTime.after(new Date())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if(invalidatedTokenRepository.existsById(jwt.getJWTClaimsSet().getJWTID())){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return jwt;

    }
}
