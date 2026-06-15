package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.dto.response.UserResponse;

public interface UserService {


    UserResponse createUser(UserCreationRequest request);

}
