package com.swp391.horseracing.module.common.repository.httpclient;

import com.swp391.horseracing.module.auth.dto.ExchangeTokenRequest;
import com.swp391.horseracing.module.auth.dto.ExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "outbound-identity", url = "https://oauth2.googleapis.com")
public interface OutBoundIdentityClient {

    @PostMapping(value="/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ExchangeTokenResponse exchangeToken(@QueryMap ExchangeTokenRequest request);
}
