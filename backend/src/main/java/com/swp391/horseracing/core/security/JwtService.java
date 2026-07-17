package com.swp391.horseracing.core.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.swp391.horseracing.module.common.dto.JwtInfo;
import com.swp391.horseracing.module.auth.dto.TokenPayLoad;
import com.swp391.horseracing.module.common.dto.request.IntrospectRequest;
import com.swp391.horseracing.module.common.dto.response.IntrospectResponse;
import com.swp391.horseracing.module.user.entity.User;

import java.text.ParseException;


public interface JwtService {





         IntrospectResponse introspect(IntrospectRequest introspectRequest) throws ParseException, JOSEException;


    TokenPayLoad generateAccessToken(User user);


    TokenPayLoad generateRefreshToken(User user);

         SignedJWT verifyToken(String token) throws ParseException, JOSEException;

         JwtInfo parseToken(String token) throws ParseException;

}
