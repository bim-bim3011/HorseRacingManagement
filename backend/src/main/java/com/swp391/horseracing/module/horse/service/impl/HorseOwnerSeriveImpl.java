package com.swp391.horseracing.module.horse.service.impl;

import com.swp391.horseracing.module.horse.dto.request.HorseOwnerCreationRequest;
import com.swp391.horseracing.module.horse.dto.request.UpdateHorseOwnerRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseOwnerResponse;
import com.swp391.horseracing.module.horse.dto.response.HorseStatsDto;
import com.swp391.horseracing.module.horse.dto.response.OwnerOverviewResponse;
import com.swp391.horseracing.module.horse.dto.response.UpcomingRaceOverviewDto;
import com.swp391.horseracing.module.horse.repository.HorseRepository;
import com.swp391.horseracing.module.jockey.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.module.jockey.repository.JockeyInvitationRepository;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.race.repository.RaceResultRepository;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.horse.mapper.HorseOwnerMapper;
import com.swp391.horseracing.module.horse.repository.HorseOwnerRepository;
import com.swp391.horseracing.module.common.repository.RoleRepository;
import com.swp391.horseracing.module.common.service.EmailService;
import com.swp391.horseracing.module.horse.service.HorseOwnerService;
import com.swp391.horseracing.module.common.service.OtpService;
import com.swp391.horseracing.module.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
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
    EmailService emailService;
    OtpService otpService;

    // Added for overview
    UserRepository userRepository;
    HorseRepository horseRepository;
    JockeyInvitationRepository jockeyInvitationRepository;
    RaceEntryRepository raceEntryRepository;
    RaceResultRepository raceResultRepository;

    private HorseOwner getCurrentOwner() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return horseOwnerRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_HORSE_OWNER));
    }

    @Override
    public OwnerOverviewResponse getOwnerOverview() {
        HorseOwner currentOwner = getCurrentOwner();
        Integer ownerId = currentOwner.getId();

        Integer totalHorses = horseRepository.countByOwnerId(ownerId);
        Integer hiredJockeys = jockeyInvitationRepository.countUniqueJockeysByOwnerIdAndStatus(ownerId, JockeyInvitation.InvitationStatus.accepted);
        Integer upcomingRaces = raceEntryRepository.countUpcomingRacesByOwnerId(ownerId);
        Integer totalFirstPlaces = raceResultRepository.countFirstPlacesByOwnerId(ownerId);

        org.springframework.data.domain.Pageable top3 = org.springframework.data.domain.PageRequest.of(0, 3);
        List<HorseStatsDto> topHorses = raceResultRepository.findTopHorsesByOwnerId(ownerId, top3);
        List<UpcomingRaceOverviewDto> upcomingSchedule = raceEntryRepository.findUpcomingRacesByOwnerId(ownerId, top3);

        return com.swp391.horseracing.module.horse.dto.response.OwnerOverviewResponse.builder()
                .totalHorses(totalHorses != null ? totalHorses : 0)
                .hiredJockeys(hiredJockeys != null ? hiredJockeys : 0)
                .upcomingRaces(upcomingRaces != null ? upcomingRaces : 0)
                .totalFirstPlaces(totalFirstPlaces != null ? totalFirstPlaces : 0)
                .topHorses(topHorses)
                .upcomingSchedule(upcomingSchedule)
                .build();
    }


    @Override
    @Transactional
    public HorseOwnerResponse registerHorseOwner(HorseOwnerCreationRequest request) {

        if(horseOwnerRepository.existsByUsername(request.getUsername())){
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }
        if(horseOwnerRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }

        var horseOwnerRole = roleRepository.findByRoleName("HORSE_OWNER")
                .orElseThrow(()->new AppException(ErrorCode.ROLE_NOT_FOUND));

        HorseOwner horseOwner = HorseOwner.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .status(User.UserStatus.inactive)
                .roles(new HashSet<>(Set.of(horseOwnerRole)))
                .build();

          horseOwnerRepository.save(horseOwner);

          // Gửi OTP
          String otp = emailService.generateOTP();
          otpService.saveOtp(horseOwner.getEmail(), otp);
          emailService.sendOtpEmail(horseOwner.getEmail(), otp);

        return horseOwnerMapper.toRepsonse(horseOwner);
    }


    @Override
    @Transactional
    public Void changeStatus(Integer horseOwnerId) {

        var horseOwner = findById(horseOwnerId);
        horseOwner.setStatus(User.UserStatus.active);

        return null;
    }

    @Override
    @Transactional
    public HorseOwnerResponse updateProfile(Integer horseOwnerId, UpdateHorseOwnerRequest request) {
        HorseOwner horseOwner = findById(horseOwnerId);

        if (request.getUsername() != null && !request.getUsername().equals(horseOwner.getUsername())) {
            if (horseOwnerRepository.existsByUsernameAndIdNot(request.getUsername(), horseOwnerId)) {
                throw new AppException(ErrorCode.DUPLICATE_USERNAME);
            }
            horseOwner.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(horseOwner.getEmail())) {
            if (horseOwnerRepository.existsByEmailAndIdNot(request.getEmail(), horseOwnerId)) {
                throw new AppException(ErrorCode.DUPLICATE_EMAIL);
            }
            horseOwner.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            horseOwner.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            horseOwner.setPhone(request.getPhone());
        }

        return horseOwnerMapper.toRepsonse(horseOwnerRepository.save(horseOwner));
    }

    @Override
    public Void softDeleteAccount(Integer horseOwnerId) {
        return null;
    }


    @Override
    public HorseOwnerResponse getHorseOwnerById(Integer horseOwnerId) {
       return horseOwnerMapper.toRepsonse(
             findById(horseOwnerId)
       );

    }

    private HorseOwner findById(Integer horseOwnerId) {
        return horseOwnerRepository.findById(horseOwnerId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
    }
}
