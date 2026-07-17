package com.swp391.horseracing.module.horse.service;

import com.swp391.horseracing.module.horse.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.module.horse.dto.request.UpdateHorseOwnerRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseOwnerResponse;

public interface HorseOwnerService {


    HorseOwnerResponse registerHorseOwner( HorseOwnerCreationRequest request);

    Void changeStatus(Integer horseOwnerId);

    HorseOwnerResponse updateProfile(Integer horseOwnerId, UpdateHorseOwnerRequest request);

    Void softDeleteAccount(Integer horseOwnerId);

    HorseOwnerResponse getHorseOwnerById(Integer horseOwnerId);

}
