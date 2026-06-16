package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.dto.response.SpectatorResponse;
import com.swp391.horseracing.service.UserService;
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
public class RegisterController {

    UserService userService;

    @PostMapping("/spectator")
    ApiResponse<SpectatorResponse> registerSpectator(@RequestBody SpectatorCreationRequest request){

         var result = userService.createSpectator(request);

        return ApiResponse.success(result);
    }

    @PostMapping("/horse-owner")
    ApiResponse<HorseOwnerResponse> registerHorseOwner(@RequestBody HorseOwnerCreationRequest request){


        return null;
    }
}
