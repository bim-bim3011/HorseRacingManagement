package com.swp391.horseracing.module.jockey.controller;


import com.swp391.horseracing.module.user.dto.request.UpdateJockeyProfileRequest;
import com.swp391.horseracing.module.jockey.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.jockey.service.JockeyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/jockey")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class JockeyController {

    JockeyService jockeyService;

    @PutMapping("/{id}")
    ApiResponse<JockeyResponse> updateProfile(@PathVariable Integer id,
                                               @RequestBody UpdateJockeyRequest request) {
        return ApiResponse.success(jockeyService.updateProfile(id, request));
    }

    @PutMapping(value = "/{id}/competition-profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<JockeyResponse> updateCompetitionProfile(@PathVariable Integer id,
                                                         @ModelAttribute UpdateJockeyProfileRequest request) {
        return ApiResponse.success(jockeyService.updateCompetitionProfile(id, request));
    }

    @PostMapping(value = "/{id}/certificate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<JockeyResponse> uploadCertificate(@PathVariable Integer id,
                                                   @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(jockeyService.uploadCertificate(id, file));
    }
}
