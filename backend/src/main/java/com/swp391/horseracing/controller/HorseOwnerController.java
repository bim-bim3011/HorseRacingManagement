package com.swp391.horseracing.controller;


import com.swp391.horseracing.dto.request.UpdateHorseOwnerRequest;
import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.service.HorseOwnerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/horse-owner")
@Tag(name= "Horse Owner Management",description= "APIs for managing horse owner accounts, " +
        "profiles, horses, race registrations, and jockey invitations")
public class HorseOwnerController {

    HorseOwnerService horseOwnerService;

    @GetMapping("/{id}")
    ApiResponse<HorseOwnerResponse> getHorseOwner(@PathVariable Integer id) {
        var result = horseOwnerService.getHorseOwnerById(id);
        return ApiResponse.success(result);
    }

    @PutMapping("/{id}")
    ApiResponse<HorseOwnerResponse> update(@PathVariable Integer id,
                                           @RequestBody UpdateHorseOwnerRequest request) {
        var result = horseOwnerService.updateProfile(id, request);
        return ApiResponse.success(result);
    }
}
