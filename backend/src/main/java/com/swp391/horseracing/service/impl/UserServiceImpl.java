package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.dto.response.SpectatorResponse;
import com.swp391.horseracing.dto.response.UserResponse;
import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.mapper.UserMapper;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class UserServiceImpl implements UserService {


    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    RoleRepository roleRepository;


    @Override
    public UserResponse createUser(UserCreationRequest request) {
         return null;
    }


    @Override
    public SpectatorResponse createSpectator(SpectatorCreationRequest request) {
        if(userRepository.findByUsername(request.getUsername()).isPresent()){
              throw new AppException(ErrorCode.DUPLICATE_USERNAME);
          }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }

        Role spectatorRole = roleRepository.findByRoleName("SPECTATOR")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));


            User user = User.builder()
                    .username(request.getUsername())
                    .passwordHash(passwordEncoder.encode(request.getPassword()))
                    .email(request.getEmail())
                    .status(User.UserStatus.active)
                    .roles(new HashSet<>(Set.of(spectatorRole)))
                    .build();

         userRepository.save(user);
        return userMapper.toSpectator(user);
    }
}
