package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.response.JockeyResponse;

public interface JockeyService {


    JockeyResponse registerJockey(JockeyCreationRequest request);
}
