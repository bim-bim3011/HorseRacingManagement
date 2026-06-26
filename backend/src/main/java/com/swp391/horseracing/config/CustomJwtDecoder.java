package com.swp391.horseracing.config;


import com.swp391.horseracing.dto.request.IntrospectRequest;
import com.swp391.horseracing.dto.response.IntrospectResponse;
import com.swp391.horseracing.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;
import javax.crypto.spec.SecretKeySpec;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {


    @Value("${jwt.signerKey}")
    String signerKey;

    @Autowired
    private JwtService JwtService;

     NimbusJwtDecoder jwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        log.debug("Decoding JWT Token");
        try{
            IntrospectResponse result = JwtService.introspect(IntrospectRequest.builder()
                    .token(token)
                    .build());
            if(!result.isValid()){
                throw new JwtException("Invalid token");
            }
        }catch (Exception e){
            throw new BadJwtException("Invalid token", e);
        }


       if(Objects.isNull(jwtDecoder)){
           SecretKeySpec key = new SecretKeySpec(signerKey.getBytes(), "HS512");
           jwtDecoder = NimbusJwtDecoder
                   .withSecretKey(key)
                   .macAlgorithm(MacAlgorithm.HS512)
                   .build();
       }
         return jwtDecoder.decode(token);
    }



}
