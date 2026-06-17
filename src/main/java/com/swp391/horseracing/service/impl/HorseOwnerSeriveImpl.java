package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.mapper.HorseOwnerMapper;
import com.swp391.horseracing.repository.HorseOwnerRepository;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.service.HorseOwnerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
@Slf4j
public class HorseOwnerSeriveImpl implements HorseOwnerService {

    HorseOwnerRepository horseOwnerRepository;
    PasswordEncoder passwordEncoder;
    HorseOwnerMapper horseOwnerMapper;
    RoleRepository roleRepository;

    @Override
    public HorseOwnerResponse registerHorseOwner(HorseOwnerCreationRequest request) {

        if(horseOwnerRepository.existsByUsername(request.getUsername())){
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }
        if(horseOwnerRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }

        var roles = roleRepository.findByRoleName("HORSE_OWNER")
                .orElseThrow(()->new AppException(ErrorCode.ROLE_NOT_FOUND));

        HorseOwner horseOwner = HorseOwner.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.inactive)
                .roles(new HashSet<>(Set.of(roles)))
                .build();

          horseOwnerRepository.save(horseOwner);

        return horseOwnerMapper.toRepsonse(horseOwner);
    }


    @Override
    public Void changeStatus(Integer horseOwnerId) {
        return null;
    }

    @Override
    public HorseOwnerResponse updateProfile(Integer horseOwnerId) {
        return null;
    }

    @Override
    public Void softDeleteAccount(Integer horseOwnerId) {
        return null;
    }
}
