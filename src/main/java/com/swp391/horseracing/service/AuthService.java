package com.swp391.horseracing.service;

import com.nimbusds.jose.JOSEException;
import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.request.LogoutRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.dto.response.LoginResponse;
import com.swp391.horseracing.dto.response.LogoutResponse;

import java.text.ParseException;

public interface AuthService {

      LoginResponse login (LoginRequest request);

      LogoutResponse logout(LogoutRequest request) throws ParseException, JOSEException;

}
