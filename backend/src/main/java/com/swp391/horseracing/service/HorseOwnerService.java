package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.request.UpdateHorseOwnerRequest;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;

public interface HorseOwnerService {


    HorseOwnerResponse registerHorseOwner( HorseOwnerCreationRequest request);

    Void changeStatus(Integer horseOwnerId);

    HorseOwnerResponse updateProfile(Integer horseOwnerId, UpdateHorseOwnerRequest request);

    Void softDeleteAccount(Integer horseOwnerId);

    HorseOwnerResponse getHorseOwnerById(Integer horseOwnerId);

}
