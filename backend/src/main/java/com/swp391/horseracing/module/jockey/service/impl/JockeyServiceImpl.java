package com.swp391.horseracing.module.jockey.service.impl;


import com.swp391.horseracing.module.jockey.dto.request.JockeyCreationRequest;
import com.swp391.horseracing.module.user.dto.request.UpdateJockeyProfileRequest;
import com.swp391.horseracing.module.jockey.dto.request.UpdateJockeyRequest;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.jockey.mapper.JockeyMapper;
import com.swp391.horseracing.module.jockey.repository.JockeyRepository;
import com.swp391.horseracing.module.common.repository.RoleRepository;
import com.swp391.horseracing.module.common.service.CloudinaryService;
import com.swp391.horseracing.module.common.service.EmailService;
import com.swp391.horseracing.module.jockey.service.JockeyService;
import com.swp391.horseracing.module.common.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
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
    EmailService emailService;
    OtpService otpService;


    @Override
    @Transactional
    public JockeyResponse registerJockey(JockeyCreationRequest request) {
           if(jockeyRepository.existsByUsername(request.getUsername())){
               throw new AppException(ErrorCode.DUPLICATE_USERNAME);
           }
           if(jockeyRepository.existsByEmail(request.getEmail())){
               throw new AppException(ErrorCode.DUPLICATE_EMAIL);
           }


           var jockeyRole = roleRepository.findByRoleName("JOCKEY")
                   .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        Jockey jockey = Jockey.builder()
                .username(request.getUsername())
                .email(request.getEmail())

                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.inactive)
                .jockeyStatus(Jockey.JockeyStatus.pending_certification)
                .roles(new HashSet<>(Set.of(jockeyRole)))

                .build();

        jockeyRepository.save(jockey);

        // Gửi OTP
        String otp = emailService.generateOTP();
        otpService.saveOtp(jockey.getEmail(), otp);
        emailService.sendOtpEmail(jockey.getEmail(), otp);

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
        jockey.setJockeyStatus(Jockey.JockeyStatus.pending_certification);

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
        jockey.setJockeyStatus(Jockey.JockeyStatus.pending_certification);

        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    @Override
    @Transactional
    public JockeyResponse updateCompetitionProfile(Integer jockeyId, UpdateJockeyProfileRequest request) {
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

        if (request.getFirstName() != null) {
            jockey.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            jockey.setLastName(request.getLastName());
        }

        if (request.getHeight() != null) {
            jockey.setHeight(request.getHeight());
        }

        if (request.getGender() != null) {
            jockey.setGender(request.getGender());
        }

        if (request.getDob() != null) {
            jockey.setDob(request.getDob());
        }

        MultipartFile file = request.getFile();
        if (file != null && !file.isEmpty()) {
            String certificateUrl = cloudinaryService.uploadFile(file, "EliteDerbyCloud/Jockey");
            jockey.setCertificateUrl(certificateUrl);
        }

        jockey.setJockeyStatus(Jockey.JockeyStatus.pending_certification);
        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    @Override
    public List<JockeyResponse> getPendingCertificationRequests() {
        return jockeyRepository.findByJockeyStatus(Jockey.JockeyStatus.pending_certification)
                .stream()
                .map(jockeyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public JockeyResponse approveCertification(Integer jockeyId) {
        Jockey jockey = findById(jockeyId);

        if (jockey.getExperienceYears() == null
                || jockey.getWeight() == null
                || jockey.getCertificateUrl() == null
                || jockey.getCertificateUrl().isBlank()) {
            throw new AppException(ErrorCode.JOCKEY_PROFILE_INCOMPLETE);
        }

        jockey.setJockeyStatus(Jockey.JockeyStatus.approval);
        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    @Override
    @Transactional
    public JockeyResponse rejectCertification(Integer jockeyId) {
        Jockey jockey = findById(jockeyId);
        jockey.setJockeyStatus(Jockey.JockeyStatus.rejected);
        return jockeyMapper.toResponse(jockeyRepository.save(jockey));
    }

    private Jockey findById(Integer jockeyId) {
        return jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new AppException(ErrorCode.JOCKEY_NOT_FOUND));
    }
}
