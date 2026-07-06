package com.swp391.horseracing.controller;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.ApiResponse;
import com.swp391.horseracing.dto.response.TournamentResponse;
import com.swp391.horseracing.service.TournamentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Tournament", description = "Tournament management APIs")
public class TournamentController {
    TournamentService tournamentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Create Tournanment",
            description = "Only ADMIN can create tournament"
    )
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<TournamentResponse> create(
            @ModelAttribute TournamentRequest request,
            @RequestPart(value = "banner", required = false) MultipartFile banner) {
        return ApiResponse.success(tournamentService.createTournament(request, banner));
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Get Tournament by ID",
            description = "Get tournament detail by ID"
    )
    public ApiResponse<TournamentResponse> getOne(@PathVariable Integer id) {
        return ApiResponse.success(tournamentService.getTournament(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Update Tournanment",
            description = "Only ADMIN can update tournament"
    )
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<TournamentResponse> update(@PathVariable Integer id,
                                                  @ModelAttribute TournamentRequest request,
                                                  @RequestPart(value = "banner", required = false) MultipartFile banner) {
        return ApiResponse.success(tournamentService.updateTournament(id, request, banner));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Delete Tournament",
            description = "Only ADMIN can delete tournament"
    )
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ApiResponse<String> delete(@PathVariable Integer id) {
        tournamentService.deleteTournament(id);
        return ApiResponse.success("Delete successfully!");
    }
    @GetMapping
    @Operation(
            summary = "Get All Tournaments",
            description = "Get all tournaments"
    )
    public ApiResponse<List<TournamentResponse>> getAll() {
        return ApiResponse.success(tournamentService.getAllTournaments());
    }
}
