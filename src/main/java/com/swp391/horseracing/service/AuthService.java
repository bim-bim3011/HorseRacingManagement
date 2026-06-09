package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.request.LoginRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.dto.response.LoginResponse;

public interface AuthService {

      LoginResponse login (LoginRequest request);

}
