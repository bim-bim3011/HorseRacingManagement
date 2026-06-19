package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.mapper.JockeyMapper;
import com.swp391.horseracing.repository.JockeyRepository;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.service.CloudinaryService;
import com.swp391.horseracing.service.JockeyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
public class JockeyServiceImpl implements JockeyService {

    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    JockeyRepository jockeyRepository;
    JockeyMapper jockeyMapper;
    CloudinaryService cloudinaryService;


    @Override
    @Transactional
    public JockeyResponse registerJockey(JockeyCreationRequest request) {
           if(jockeyRepository.existsByUsername(request.getUsername())){
               throw new AppException(ErrorCode.DUPLICATE_USERNAME);
           }
           if(jockeyRepository.existsByEmail(request.getEmail())){
               throw new AppException(ErrorCode.DUPLICATE_EMAIL);
           }


           var roles = roleRepository.findByRoleName("JOCKEY")
                   .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        Jockey jockey = Jockey.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.active)
                .jockeyStatus(Jockey.JockeyStatus.pending_certification)
                .roles(new HashSet<>(Set.of(roles)))
                .build();

        jockeyRepository.save(jockey);

           return jockeyMapper.toResponse(jockey);
    }

    @Override
    @Transactional
    public JockeyResponse updateProfile(Integer jockeyId, UpdateJockeyRequest request) {
        Jockey jockey = findById(jockeyId);

        if (request.getUsername() != null && !request.getUsername().equals(jockey.getUsername())) {
            if (jockeyRepository.existsByUsernameAndIdNot(request.getUsername(), jockeyId)) {
                throw new AppException(ErrorCode.DUPLICATE_USERNAME);
            }
            jockey.setUsername(request.getUsername());
        }

        if (request.getFullName() != null) {
            jockey.setFullName(request.getFullName());
        }
        if (request.getExperience_year() != null) {
            jockey.setExperienceYears(request.getExperience_year());
        }
        if (request.getWeight() != null) {
            jockey.setWeight(request.getWeight());
        }
        if (request.getCertificate_url() != null) {
            jockey.setCertificateUrl(request.getCertificate_url());
        }

        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    @Override
    @Transactional
    public JockeyResponse uploadCertificate(Integer jockeyId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED);
        }

        Jockey jockey = findById(jockeyId);
        String certificateUrl = cloudinaryService.uploadFile(file, "EliteDerbyCloud/Jockey");
        jockey.setCertificateUrl(certificateUrl);

        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    private Jockey findById(Integer jockeyId) {
        return jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }
}
