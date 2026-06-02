package com.swp391.horseracing.security;

import com.nimbusds.jwt.JWTClaimsSet;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;

public interface JwtService {



         boolean isTokenValid(String token);



}
