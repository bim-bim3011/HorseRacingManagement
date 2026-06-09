package com.swp391.horseracing.security;

import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.entity.User;


public interface JwtService {



         boolean isTokenValid(String token);

         IntrospectResponse introspect(IntrospectRequest introspectRequest);


         String generateToken(User user);


}
