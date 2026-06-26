package com.swp391.horseracing.mapper;

import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.entity.profile.Jockey;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JockeyMapper {


    @Mapping(source = "certificateUrl", target = "certificateUrl")
    JockeyResponse toResponse(Jockey jockey);

}
