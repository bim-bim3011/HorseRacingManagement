package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.dto.response.SpectatorResponse;
import com.swp391.horseracing.service.HorseOwnerService;
import com.swp391.horseracing.service.JockeyService;
import com.swp391.horseracing.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
}
