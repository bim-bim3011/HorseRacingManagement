package com.swp391.horseracing.module.jockey.service;

import com.swp391.horseracing.module.jockey.dto.request.JockeyInvitationRequest;
import com.swp391.horseracing.module.jockey.dto.response.JockeyInvitationResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;

import java.util.List;

public interface JockeyInvitationService {
    JockeyInvitationResponse sendInvitation(JockeyInvitationRequest request);
    List<JockeyInvitationResponse> getInvitationsByHorse(Integer horseId);
    List<JockeyInvitationResponse> getMyInvitations();
    void acceptInvitation(Integer id);
    void declineInvitation(Integer id);
    List<JockeyResponse> getAvailableJockeys();
    org.springframework.data.domain.Page<JockeyResponse> getAvailableJockeysPaginated(String keyword, String gender, Integer minExperience, Float maxWeight, String sortBy, String sortDir, int page, int size);
}
