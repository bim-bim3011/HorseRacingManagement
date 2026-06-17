package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import org.springframework.web.bind.annotation.RequestBody;

public interface HorseOwnerService {


    HorseOwnerResponse registerHorseOwner( HorseOwnerCreationRequest request);

    Void changeStatus(Integer horseOwnerId);

    HorseOwnerResponse updateProfile(Integer horseOwnerId);

    Void softDeleteAccount(Integer horseOwnerId);

}
