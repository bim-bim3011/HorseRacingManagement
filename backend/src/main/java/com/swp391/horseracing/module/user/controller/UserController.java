package com.swp391.horseracing.module.user.controller;


import com.swp391.horseracing.module.user.dto.request.UpdateUserProfileRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.user.dto.response.UserProfileResponse;
import com.swp391.horseracing.module.user.dto.response.UserResponse;
import com.swp391.horseracing.module.user.service.UserService;
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

    @GetMapping("/my-profile")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.success(userService.getMyProfile());
    }

    @PutMapping("/my-profile")
    public ApiResponse<UserProfileResponse> updateMyProfile(@RequestBody UpdateUserProfileRequest request) {
        return ApiResponse.success(userService.updateMyProfile(request));
    }
}
