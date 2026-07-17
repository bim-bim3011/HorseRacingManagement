package com.swp391.horseracing.module.horse.mapper;

import com.swp391.horseracing.module.horse.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.module.horse.entity.horse.Horse;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HorseOwnerMapper {

    Horse toHorse(HorseOwnerCreationRequest request);

    HorseOwnerResponse toRepsonse(HorseOwner requerst);


}
