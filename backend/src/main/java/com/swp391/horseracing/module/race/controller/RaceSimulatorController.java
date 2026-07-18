package com.swp391.horseracing.module.race.controller;

import com.swp391.horseracing.module.race.dto.response.realtime.RaceSnapshotResponse;
import com.swp391.horseracing.module.race.service.RaceSimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/tournaments/{tournamentId}/races/{raceId}/simulator")
@RequiredArgsConstructor
public class RaceSimulatorController {

    private final RaceSimulationService simulationService;

    @PostMapping("/start")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ResponseEntity<String> startRace(@PathVariable Integer tournamentId, @PathVariable Integer raceId) {
        simulationService.startRace(raceId);
        return ResponseEntity.ok("Race " + raceId + " simulation started successfully");
    }

    @PostMapping("/pause")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ResponseEntity<String> pauseRace(@PathVariable Integer tournamentId, @PathVariable Integer raceId) {
        simulationService.pauseRace(raceId);
        return ResponseEntity.ok("Race " + raceId + " simulation paused");
    }

    @PostMapping("/resume")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ResponseEntity<String> resumeRace(@PathVariable Integer tournamentId, @PathVariable Integer raceId) {
        simulationService.resumeRace(raceId);
        return ResponseEntity.ok("Race " + raceId + " simulation resumed");
    }

    @PostMapping("/stop")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_ADMIN')")
    public ResponseEntity<String> stopRace(@PathVariable Integer tournamentId, @PathVariable Integer raceId) {
        simulationService.stopRace(raceId);
        return ResponseEntity.ok("Race " + raceId + " simulation stopped");
    }

    @PostMapping("/flag/{horseId}")
    @PreAuthorize("hasAuthority('SCOPE_ROLE_REFEREE')")
    public ResponseEntity<String> flagHorse(
            @PathVariable Integer tournamentId, 
            @PathVariable Integer raceId, 
            @PathVariable Integer horseId,
            Principal principal) {
        String refereeUsername = principal != null ? principal.getName() : "Unknown";
        simulationService.flagHorse(raceId, horseId, refereeUsername);
        return ResponseEntity.ok("Horse " + horseId + " has been flagged.");
    }

    @GetMapping("/state")
    public ResponseEntity<RaceSnapshotResponse> getRaceState(@PathVariable Integer tournamentId, @PathVariable Integer raceId) {
        RaceSnapshotResponse state = simulationService.getRaceState(raceId);
        return ResponseEntity.ok(state);
    }

    @GetMapping("/incidents")
    public ResponseEntity<java.util.List<com.swp391.horseracing.module.race.dto.response.RaceIncidentResponse>> getRaceIncidents(
            @PathVariable Integer tournamentId, 
            @PathVariable Integer raceId) {
        return ResponseEntity.ok(simulationService.getRaceIncidents(raceId));
    }
}
