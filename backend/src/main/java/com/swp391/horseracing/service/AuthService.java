package com.swp391.horseracing.service;

import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.request.LogoutRequest;
import com.swp391.horseracing.dto.request.RefreshRequest;
import com.swp391.horseracing.dto.response.AuthenticationResponse;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.dto.response.LogoutResponse;

import java.text.ParseException;

public interface AuthService {

      AuthenticationResponse login (LoginRequest request);

      LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException;

      AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException;


      LogoutResponse  LogoutUsingRedis(LogoutRequest request) throws ParseException;
}
