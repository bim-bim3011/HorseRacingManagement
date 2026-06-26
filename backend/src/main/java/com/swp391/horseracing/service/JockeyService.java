package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.request.UpdateJockeyProfileRequest;
import com.swp391.horseracing.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.dto.response.JockeyResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface JockeyService {


    JockeyResponse registerJockey(JockeyCreationRequest request);

    JockeyResponse updateProfile(Integer jockeyId, UpdateJockeyRequest request);

    JockeyResponse uploadCertificate(Integer jockeyId, MultipartFile file);

    JockeyResponse updateCompetitionProfile(Integer jockeyId, UpdateJockeyProfileRequest request);

    List<JockeyResponse> getPendingCertificationRequests();

    JockeyResponse approveCertification(Integer jockeyId);

    JockeyResponse rejectCertification(Integer jockeyId);
}
