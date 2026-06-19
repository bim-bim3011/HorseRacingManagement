package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.dto.response.JockeyResponse;
import org.springframework.web.multipart.MultipartFile;

public interface JockeyService {


    JockeyResponse registerJockey(JockeyCreationRequest request);

    JockeyResponse updateProfile(Integer jockeyId, UpdateJockeyRequest request);

    JockeyResponse uploadCertificate(Integer jockeyId, MultipartFile file);
}
