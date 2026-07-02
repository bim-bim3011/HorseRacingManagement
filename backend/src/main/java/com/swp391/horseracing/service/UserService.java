package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.dto.response.SpectatorResponse;
import com.swp391.horseracing.dto.response.UserResponse;

public interface UserService {


    UserResponse createUser(UserCreationRequest request);

    SpectatorResponse createSpectator(SpectatorCreationRequest request);

    com.swp391.horseracing.dto.response.UserProfileResponse getMyProfile();

    com.swp391.horseracing.dto.response.UserProfileResponse updateMyProfile(com.swp391.horseracing.dto.request.UpdateUserProfileRequest request);
}
