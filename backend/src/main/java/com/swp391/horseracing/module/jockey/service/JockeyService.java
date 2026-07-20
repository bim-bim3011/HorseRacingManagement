package com.swp391.horseracing.module.jockey.service;

import com.swp391.horseracing.module.jockey.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.module.user.dto.request.UpdateJockeyProfileRequest;
import com.swp391.horseracing.module.jockey.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
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
