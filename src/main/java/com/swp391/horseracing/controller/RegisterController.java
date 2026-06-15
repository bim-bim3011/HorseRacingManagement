package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.SpectatorCreationResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/register")
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
public class RegisterController {


    @PostMapping("/")
    ApiResponse<String> register(){

        return ApiResponse.success("chua xong");

    }

}
