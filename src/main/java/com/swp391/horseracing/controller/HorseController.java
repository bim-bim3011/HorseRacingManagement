package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.request.HorseCreationRequest;
import com.swp391.horseracing.dto.response.ApiResponse;
import com.swp391.horseracing.dto.response.HorseResponse;
import com.swp391.horseracing.service.HorseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/horses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Horse", description = "Horse Management API")
public class HorseController {
    HorseService horseService;
    @PostMapping
    @Operation(
            summary = "Create Horse",
            description = "Only Horse Owner can create horse"
    )
    public ApiResponse<HorseResponse> create(@RequestBody HorseCreationRequest request) {
        return ApiResponse.success(horseService.createHorse(request));
    }
    @GetMapping("/{id}")
    @Operation(
            summary = "Get Horse by ID",
            description = "Anyone can view horse detail"
    )
    public ApiResponse<HorseResponse> getOne(@PathVariable Integer id) {
        return ApiResponse.success(horseService.getHorse(id));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update Horse",
            description = "Only Horse Owner can update their horse"
    )
    public ApiResponse<HorseResponse> update(@PathVariable Integer id,
                                             @RequestBody HorseCreationRequest request) {
        return ApiResponse.success(horseService.updateHorse(id, request));
    }
    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete Horse",
            description = "Only Horse Owner can delete their horse"
    )
    public ApiResponse<String> delete(@PathVariable Integer id) {
        horseService.deleteHorse(id);
        return ApiResponse.success("Delete successfully!");
    }
    @GetMapping("/my-horses")
    @Operation(
            summary = "Get My Horses",
            description = "Horse Owner view their own horses"
    )
    public ApiResponse<List<HorseResponse>> getMyHorses() {
        return ApiResponse.success(horseService.getMyHorses());
    }
    @PostMapping("/{id}/upload-certificate")
    @Operation(
            summary = "Upload Health Certificate",
            description = "Horse Owner upload health certificate"
    )
    public ApiResponse<String> uploadCertificate(@PathVariable Integer id,
                                                 @RequestParam("file") MultipartFile file) {
        return ApiResponse.success(horseService.uploadCertificate(id, file));
    }
    //hàm này ngựa mới đc phép xét tuyển vòng 1 là đc duyệt hồ sơ( có giấy khám) có thể tham gia race còn vòng 2 duyệt đki đua là duyệt vào race nào cụ thể
    @PatchMapping("/{id}/approve")
    //@PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Approve Horse",
            description = "Only ADMIN can approve horse"
    )
    public ApiResponse<String> approve(@PathVariable Integer id) {
        horseService.approveHorse(id);
        return ApiResponse.success("Horse approved!");
    }
    //còn hàm này là bị loại ngay vòng 1
    @PatchMapping("/{id}/reject")
    //@PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Reject Horse",
            description = "Only ADMIN can reject horse")
    public ApiResponse<String> reject(@PathVariable Integer id) {
        horseService.rejectHorse(id);
        return ApiResponse.success("Horse rejected!");
    }
    //danh sách dành cho admin xem những con ngựa đang chờ duyệt vòng 1
    @GetMapping("/pending")
   // @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Pending Horses", description = "Admin view list of horses waiting for approval")
    public ApiResponse<List<HorseResponse>> getPendingHorses() {
        return ApiResponse.success(horseService.getPendingHorses());
    }
}
