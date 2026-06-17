package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.mapper.JocketMapper;
import com.swp391.horseracing.repository.JockeyRepository;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.service.CloudinaryService;
import com.swp391.horseracing.service.JockeyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
public class JockeyServiceImpl implements JockeyService {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    JockeyRepository jockeyRepository;
    JocketMapper  jocketMapper;
    CloudinaryService cloudinaryService;


    @Override
    public JockeyResponse registerJockey(JockeyCreationRequest request) {
        return null;
    }
}
