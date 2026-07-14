package com.swp391.horseracing.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.horseracing.dto.JwtInfo;
import com.swp391.horseracing.dto.TokenPayLoad;
import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.entity.User;

import java.text.ParseException;


public interface JwtService {





         IntrospectResponse introspect(IntrospectRequest introspectRequest) throws ParseException, JOSEException;


    TokenPayLoad generateAccessToken(User user);


    TokenPayLoad generateRefreshToken(User user);

         SignedJWT verifyToken(String token) throws ParseException, JOSEException;

         JwtInfo parseToken(String token) throws ParseException;

}
