package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.UserResponse;
import com.swp391.horseracing.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    UserService userService;

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUser(@PathVariable Integer id){

        return null;
    }
}
