package com.swp391.horseracing.module.race.service;

import com.swp391.horseracing.module.race.dto.request.ViolationRequest;
import com.swp391.horseracing.module.race.dto.response.ViolationResponse;

import java.util.List;

public interface ViolationService {
    List<ViolationResponse> createViolation(Integer raceId, ViolationRequest request);
    List<ViolationResponse> getViolationsByRace(Integer raceId);
    void deleteViolation(Integer raceId, Integer violationId);
}
