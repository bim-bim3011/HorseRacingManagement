package com.swp391.horseracing.module.user.service;

import com.swp391.horseracing.module.common.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.module.common.dto.request.VerifyAccountRequest;
import com.swp391.horseracing.module.user.dto.request.UpdateUserProfileRequest;
import com.swp391.horseracing.module.user.dto.request.UserCreationRequest;
import com.swp391.horseracing.module.common.dto.response.SpectatorResponse;
import com.swp391.horseracing.module.user.dto.response.UserProfileResponse;
import com.swp391.horseracing.module.user.dto.response.UserResponse;

public interface UserService {


    UserResponse createUser(UserCreationRequest request);

    SpectatorResponse createSpectator(SpectatorCreationRequest request);

    UserProfileResponse getMyProfile();

    UserProfileResponse updateMyProfile(UpdateUserProfileRequest request);
    
    void verifyAccount(VerifyAccountRequest request);
    
    void resendOtp(String email);
}
