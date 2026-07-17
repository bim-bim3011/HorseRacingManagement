package com.swp391.horseracing.module.race.service;

import com.swp391.horseracing.module.race.dto.request.RefereeCreationRequest;
import com.swp391.horseracing.module.race.dto.request.RefereeAssignmentRequest;
import com.swp391.horseracing.module.race.dto.request.UpdateRefereeRequest;
import com.swp391.horseracing.module.race.dto.response.RefereeAssignmentResponse;
import com.swp391.horseracing.module.race.dto.response.RefereeResponse;

import java.util.List;

public interface RefereeService {
    RefereeResponse createReferee(RefereeCreationRequest request);

    List<RefereeResponse> getAllReferees();

    List<RefereeResponse> getActiveReferees();

    RefereeResponse getReferee(Integer refereeId);

    RefereeResponse updateReferee(Integer refereeId, UpdateRefereeRequest request);

    void deleteReferee(Integer refereeId);

    List<RefereeAssignmentResponse> getAssignmentsByRace(Integer raceId);

    List<RefereeAssignmentResponse> getAssignmentsByReferee(Integer refereeId);

    RefereeAssignmentResponse assignToRace(Integer raceId, RefereeAssignmentRequest request);

    void unassignFromRace(Integer raceId, Integer refereeId);
}
