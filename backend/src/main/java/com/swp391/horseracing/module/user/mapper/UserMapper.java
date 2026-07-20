package com.swp391.horseracing.module.user.mapper;


import com.swp391.horseracing.module.user.dto.request.UserCreationRequest;
import com.swp391.horseracing.module.common.dto.response.SpectatorResponse;
import com.swp391.horseracing.module.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel="spring")
public interface UserMapper {

    User toUser(UserCreationRequest request);

    SpectatorResponse toSpectator(User request);

}
