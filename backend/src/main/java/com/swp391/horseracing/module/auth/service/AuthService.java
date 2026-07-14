package com.swp391.horseracing.module.auth.service;

import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.module.common.dto.request.IntrospectRequest;
import com.swp391.horseracing.module.common.dto.request.LoginRequest;
import com.swp391.horseracing.module.common.dto.request.LogoutRequest;
import com.swp391.horseracing.module.common.dto.request.RefreshRequest;
import com.swp391.horseracing.module.auth.dto.response.AuthenticationResponse;
import com.swp391.horseracing.module.common.dto.response.IntrospectResponse;
import com.swp391.horseracing.module.common.dto.response.LoginResponse;
import com.swp391.horseracing.module.common.dto.response.LogoutResponse;

import java.text.ParseException;

public interface AuthService {

      AuthenticationResponse login (LoginRequest request);

      LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException;

      AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;


      LogoutResponse  LogoutUsingRedis(LogoutRequest request) throws ParseException;

      AuthenticationResponse adminLogin(LoginRequest request);

      AuthenticationResponse outboundAuthenticate(String code);
}
