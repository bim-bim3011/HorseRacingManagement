package com.swp391.horseracing.mapper;


import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel="spring")
public interface UserMapper {

    User toUser(UserCreationRequest request);

}
