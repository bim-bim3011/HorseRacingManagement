package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.SpectatorCreationRequest;
import com.swp391.horseracing.dto.request.UserCreationRequest;
import com.swp391.horseracing.dto.response.SpectatorResponse;
import com.swp391.horseracing.dto.response.UserProfileResponse;
import com.swp391.horseracing.dto.response.UserResponse;
import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.betting.Wallet;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.mapper.UserMapper;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.repository.WalletRepository;
import com.swp391.horseracing.service.EmailService;
import com.swp391.horseracing.service.OtpService;
import com.swp391.horseracing.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@Slf4j
public class UserServiceImpl implements UserService {


    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    UserMapper userMapper;
    RoleRepository roleRepository;
    WalletRepository walletRepository;
    EmailService emailService;
    OtpService otpService;


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
                    .status(User.UserStatus.inactive)
                    .roles(new HashSet<>(Set.of(spectatorRole)))
                    .build();

        userRepository.save(user);

        // Gửi OTP
        String otp = emailService.generateOTP();
        otpService.saveOtp(user.getEmail(), otp);
        emailService.sendOtpEmail(user.getEmail(), otp);

        // Tạo Wallet mặc định cho User mới (balance = 0)
        Wallet wallet = Wallet.builder()
                .user(user)
                .build();
        walletRepository.save(wallet);

        return userMapper.toSpectator(user);
    }

    @Override
    public UserProfileResponse getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        UserProfileResponse response = UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(user.getStatus().name())
                .roles(user.getRoles().stream().map(Role::getRoleName).collect(Collectors.toList()))
                .build();

        if (user.getWallet() != null) {
            response.setWalletBalance(user.getWallet().getBalance());
        }

        if (user instanceof Jockey j) {
            response.setFullName(j.getFullName());
            response.setWeight(j.getWeight());
            response.setExperienceYears(j.getExperienceYears());
            response.setCertificateUrl(j.getCertificateUrl());
            if (j.getJockeyStatus() != null) {
                response.setJockeyStatus(j.getJockeyStatus().name());
            }
            response.setFirstName(j.getFirstName());
            response.setLastName(j.getLastName());
            response.setHeight(j.getHeight());
            response.setGender(j.getGender());
            response.setDob(j.getDob());
        } else if (user instanceof HorseOwner ho) {
            response.setFullName(ho.getFullName());
            response.setPhone(ho.getPhone());
        }

        return response;
    }

    @Override
    public UserProfileResponse updateMyProfile(com.swp391.horseracing.dto.request.UpdateUserProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new AppException(ErrorCode.DUPLICATE_USERNAME);
            }
            user.setUsername(request.getUsername());
        }

        if (user instanceof Jockey j) {
            if (request.getFirstName() != null) j.setFirstName(request.getFirstName());
            if (request.getLastName() != null) j.setLastName(request.getLastName());
            if (request.getFullName() != null) j.setFullName(request.getFullName());
            if (request.getWeight() != null) j.setWeight(request.getWeight());
            if (request.getHeight() != null) j.setHeight(request.getHeight());
            if (request.getGender() != null) j.setGender(request.getGender());
            if (request.getDob() != null) j.setDob(request.getDob());
            if (request.getExperienceYears() != null) j.setExperienceYears(request.getExperienceYears());
        } else if (user instanceof HorseOwner ho) {
            if (request.getFullName() != null) ho.setFullName(request.getFullName());
            if (request.getPhone() != null) ho.setPhone(request.getPhone());
        }

        userRepository.save(user);

        return getMyProfile();
    }

    @Override
    public void verifyAccount(com.swp391.horseracing.dto.request.VerifyAccountRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }

        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        user.setStatus(User.UserStatus.active);
        userRepository.save(user);
        otpService.clearOtp(request.getEmail());
    }

    @Override
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        if (user.getStatus() != User.UserStatus.inactive) {
            throw new AppException(ErrorCode.INVALID_USER_STATUS);
        }

        String otp = emailService.generateOTP();
        otpService.saveOtp(user.getEmail(), otp);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }
}
