package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.dto.response.UserResponse;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class UserServiceImpl implements UserService {


    UserRepository userRepository;


    @Override
    public UserResponse createUser(UserCreationRequest request) {
         return null;
    }
}
