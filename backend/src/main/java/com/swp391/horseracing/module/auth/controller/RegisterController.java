package com.swp391.horseracing.module.auth.controller;


import com.swp391.horseracing.module.horse.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.module.jockey.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.module.common.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.common.dto.request.VerifyAccountRequest;
import com.swp391.horseracing.module.common.dto.request.ResendOtpRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.common.dto.response.SpectatorResponse;
import com.swp391.horseracing.module.horse.service.HorseOwnerService;
import com.swp391.horseracing.module.jockey.service.JockeyService;
import com.swp391.horseracing.module.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/register")
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
@Tag(name= "registration",description= "regsiter account for spectator, horse owner, jockey")
public class RegisterController {

    UserService userService;
    HorseOwnerService horseOwnerService;
    JockeyService jockeyService;


    @Operation(
            summary = "register spectator account"
    )
    @PostMapping("/spectator")
    ApiResponse<SpectatorResponse> registerSpectator(@RequestBody SpectatorCreationRequest request){
        var result = userService.createSpectator(request);
        return ApiResponse.success(result);
    }
    @Operation(
            summary = "register horse owner account "
    )
    @PostMapping("/horse-owner")
    ApiResponse<HorseOwnerResponse> registerHorseOwner(@RequestBody HorseOwnerCreationRequest request){
        var result = horseOwnerService.registerHorseOwner(request);
        return ApiResponse.success(result);
    }

    @Operation(
            summary = "register jockey account "
    )
    @PostMapping("/jockey")
    ApiResponse<JockeyResponse> registerJockey(@RequestBody JockeyCreationRequest request){
        var result = jockeyService.registerJockey(request);
        return ApiResponse.success(result);
    }

    @Operation(
            summary = "verify user account with OTP"
    )
    @PostMapping("/verify-account")
    public ApiResponse<String> verifyAccount(@RequestBody @Valid VerifyAccountRequest request) {
        userService.verifyAccount(request);
        return ApiResponse.success("Tài khoản đã được kích hoạt thành công!");
    }

    @Operation(
            summary = "resend OTP for inactive user"
    )
    @PostMapping("/resend-otp")
    public ApiResponse<String> resendOtp(@RequestBody @Valid ResendOtpRequest request) {
        userService.resendOtp(request.getEmail());
        return ApiResponse.success("Mã OTP mới đã được gửi đến email của bạn.");
    }
}
