package com.swp391.horseracing.mapper;

import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.entity.profile.Jockey;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JocketMapper {

    JockeyResponse toResponse(Jockey jockey);

}
