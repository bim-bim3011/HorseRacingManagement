package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.JockeyInvitationRequest;
import com.swp391.horseracing.dto.response.JockeyInvitationResponse;
import com.swp391.horseracing.dto.response.JockeyResponse;

import java.util.List;

public interface JockeyInvitationService {
    JockeyInvitationResponse sendInvitation(JockeyInvitationRequest request);
    List<JockeyInvitationResponse> getInvitationsByHorse(Integer horseId);
    List<JockeyInvitationResponse> getMyInvitations();
    void acceptInvitation(Integer id);
    void declineInvitation(Integer id);
    List<JockeyResponse> getAvailableJockeys();
}
