package com.swp391.horseracing.module.jockey.mapper;

import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JockeyMapper {


    JockeyResponse toResponse(Jockey jockey);

}
