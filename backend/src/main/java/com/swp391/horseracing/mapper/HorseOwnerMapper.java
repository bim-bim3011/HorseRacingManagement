package com.swp391.horseracing.mapper;

import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HorseOwnerMapper {

    Horse toHorse(HorseOwnerCreationRequest request);

    HorseOwnerResponse toRepsonse(HorseOwner requerst);


}
