package com.swp391.horseracing.module.horse.controller;

import com.swp391.horseracing.module.horse.dto.request.HorseCreationRequest;
import com.swp391.horseracing.module.common.dto.ApiResponse;
import com.swp391.horseracing.module.horse.dto.response.HorseResponse;
import com.swp391.horseracing.module.horse.service.HorseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.data.domain.Page;
import com.swp391.horseracing.module.horse.entity.horse.Horse.HorseStatus;

@RestController
@RequestMapping("/api/horses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Horse", description = "Horse Management API")
public class HorseController {
    HorseService horseService;

    @PostMapping
    @Operation(summary = "Create Horse", description = "Only Horse Owner can create horse")
    public ApiResponse<HorseResponse> create(
            @RequestPart("horse") HorseCreationRequest request,
            @RequestPart(value = "certificate", required = false) MultipartFile certificate) {
        return ApiResponse.success(horseService.createHorse(request, certificate));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Horse by ID", description = "Anyone can view horse detail")
    public ApiResponse<HorseResponse> getOne(@PathVariable Integer id) {
        return ApiResponse.success(horseService.getHorse(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Horse", description = "Only Horse Owner can update their horse")
    public ApiResponse<HorseResponse> update(@PathVariable Integer id,
            @RequestPart("horse") HorseCreationRequest request,
            @RequestPart(value = "certificate", required = false) MultipartFile certificate) {
        return ApiResponse.success(horseService.updateHorse(id, request, certificate));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Horse", description = "Only Horse Owner can delete their horse")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        horseService.deleteHorse(id);
        return ApiResponse.success("Delete successfully!");
    }

    @GetMapping("/my-horses")
    @Operation(summary = "Get My Horses", description = "Horse Owner view their own horses")
    public ApiResponse<List<HorseResponse>> getMyHorses() {
        return ApiResponse.success(horseService.getMyHorses());
    }

    @GetMapping("/my-horses/paginated")
    @Operation(summary = "Get My Horses Paginated", description = "Horse Owner view their own horses with pagination and filters")
    public ApiResponse<Page<HorseResponse>> getMyHorsesPaginated(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) HorseStatus status,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ApiResponse.success(horseService.getMyHorses(keyword, status, gender, page, size, sortBy, sortDir));
    }

    @PostMapping("/{id}/upload-certificate")
    @Operation(summary = "Upload Health Certificate", description = "Horse Owner upload health certificate")
    public ApiResponse<String> uploadCertificate(@PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(horseService.uploadCertificate(id, file));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Approve Horse", description = "Only ADMIN can approve horse")
    public ApiResponse<String> approve(@PathVariable Integer id) {
        horseService.approveHorse(id);
        return ApiResponse.success("Horse approved!");
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Reject Horse", description = "Only ADMIN can reject horse")
    public ApiResponse<String> reject(@PathVariable Integer id) {
        horseService.rejectHorse(id);
        return ApiResponse.success("Horse rejected!");
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    @Operation(summary = "Get Pending Horses", description = "Admin view list of horses waiting for approval")
    public ApiResponse<List<HorseResponse>> getPendingHorses() {
        return ApiResponse.success(horseService.getPendingHorses());
    }

    @GetMapping("/{id}/profile")
    @Operation(summary = "Get Horse Profile", description = "Get detailed profile of a horse including race history and statistics")
    public ApiResponse<com.swp391.horseracing.module.horse.dto.response.HorseProfileResponse> getHorseProfile(@PathVariable Integer id) {
        return ApiResponse.success(horseService.getHorseProfile(id));
    }
}
