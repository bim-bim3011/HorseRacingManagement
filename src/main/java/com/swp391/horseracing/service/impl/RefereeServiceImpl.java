package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.RefereeCreationRequest;
import com.swp391.horseracing.dto.request.RefereeAssignmentRequest;
import com.swp391.horseracing.dto.request.UpdateRefereeRequest;
import com.swp391.horseracing.dto.response.RefereeAssignmentResponse;
import com.swp391.horseracing.dto.response.RefereeResponse;
import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.profile.Referee;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RefereeAssignment;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.RaceRepository;
import com.swp391.horseracing.repository.RefereeAssignmentRepository;
import com.swp391.horseracing.repository.RefereeRepository;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.RefereeService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RefereeServiceImpl implements RefereeService {
    RefereeRepository refereeRepository;
    RaceRepository raceRepository;
    RefereeAssignmentRepository refereeAssignmentRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public RefereeResponse createReferee(RefereeCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.DUPLICATE_USERNAME);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (refereeRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new AppException(ErrorCode.DUPLICATE_LICENSE_NUMBER);
        }

        Role refereeRole = roleRepository.findByRoleName("REFEREE")
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .roleName("REFEREE")
                                .build()
                ));

        Referee referee = Referee.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .licenseNumber(request.getLicenseNumber())
                .status(parseStatusOrDefault(request.getStatus()))
                .roles(new HashSet<>(Set.of(refereeRole)))
                .build();

        return mapRefereeToResponse(refereeRepository.save(referee));
    }

    @Override
    public List<RefereeResponse> getAllReferees() {
        return refereeRepository.findAll()
                .stream()
                .map(this::mapRefereeToResponse)
                .toList();
    }

    @Override
    public List<RefereeResponse> getActiveReferees() {
        return refereeRepository.findByStatus(User.UserStatus.active)
                .stream()
                .map(this::mapRefereeToResponse)
                .toList();
    }

    @Override
    public RefereeResponse getReferee(Integer refereeId) {
        return mapRefereeToResponse(findRefereeById(refereeId));
    }

    @Override
    @Transactional
    public RefereeResponse updateReferee(Integer refereeId, UpdateRefereeRequest request) {
        Referee referee = findRefereeById(refereeId);

        if (request.getUsername() != null && !request.getUsername().equals(referee.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), refereeId)) {
                throw new AppException(ErrorCode.DUPLICATE_USERNAME);
            }
            referee.setUsername(request.getUsername());
        }

        if (request.getEmail() != null && !request.getEmail().equals(referee.getEmail())) {
            if (userRepository.existsByEmailAndIdNot(request.getEmail(), refereeId)) {
                throw new AppException(ErrorCode.DUPLICATE_EMAIL);
            }
            referee.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            referee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getFullName() != null) {
            referee.setFullName(request.getFullName());
        }

        if (request.getLicenseNumber() != null && !request.getLicenseNumber().equals(referee.getLicenseNumber())) {
            if (refereeRepository.existsByLicenseNumberAndIdNot(request.getLicenseNumber(), refereeId)) {
                throw new AppException(ErrorCode.DUPLICATE_LICENSE_NUMBER);
            }
            referee.setLicenseNumber(request.getLicenseNumber());
        }

        if (request.getStatus() != null) {
            referee.setStatus(parseStatus(request.getStatus()));
        }

        return mapRefereeToResponse(refereeRepository.save(referee));
    }

    @Override
    @Transactional
    public void deleteReferee(Integer refereeId) {
        Referee referee = findRefereeById(refereeId);
        referee.setStatus(User.UserStatus.inactive);
        refereeRepository.save(referee);
    }

    @Override
    public List<RefereeAssignmentResponse> getAssignmentsByRace(Integer raceId) {
        raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        return refereeAssignmentRepository.findByRaceId(raceId)
                .stream()
                .map(this::mapAssignmentToResponse)
                .toList();
    }

    @Override
    public List<RefereeAssignmentResponse> getAssignmentsByReferee(Integer refereeId) {
        findRefereeById(refereeId);

        return refereeAssignmentRepository.findByRefereeId(refereeId)
                .stream()
                .map(this::mapAssignmentToResponse)
                .toList();
    }

    @Override
    @Transactional
    public RefereeAssignmentResponse assignToRace(Integer raceId, RefereeAssignmentRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        Referee referee = refereeRepository.findById(request.getRefereeId())
                .orElseThrow(() -> new AppException(ErrorCode.REFEREE_NOT_FOUND));

        if (referee.getStatus() != User.UserStatus.active) {
            throw new AppException(ErrorCode.REFEREE_NOT_ACTIVE);
        }

        if (refereeAssignmentRepository.existsByRaceIdAndRefereeId(raceId, referee.getId())) {
            throw new AppException(ErrorCode.REFEREE_ALREADY_ASSIGNED_TO_RACE);
        }

        RefereeAssignment assignment = RefereeAssignment.builder()
                .race(race)
                .referee(referee)
                .build();

        return mapAssignmentToResponse(refereeAssignmentRepository.save(assignment));
    }

    @Override
    @Transactional
    public void unassignFromRace(Integer raceId, Integer refereeId) {
        RefereeAssignment assignment = refereeAssignmentRepository.findByRaceIdAndRefereeId(raceId, refereeId)
                .orElseThrow(() -> new AppException(ErrorCode.REFEREE_ASSIGNMENT_NOT_FOUND));

        refereeAssignmentRepository.delete(assignment);
    }

    private Referee findRefereeById(Integer refereeId) {
        return refereeRepository.findById(refereeId)
                .orElseThrow(() -> new AppException(ErrorCode.REFEREE_NOT_FOUND));
    }

    private User.UserStatus parseStatusOrDefault(String status) {
        if (status == null || status.isBlank()) {
            return User.UserStatus.active;
        }
        return parseStatus(status);
    }

    private User.UserStatus parseStatus(String status) {
        try {
            return User.UserStatus.valueOf(status.trim().toLowerCase());
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.INVALID_USER_STATUS);
        }
    }

    private RefereeResponse mapRefereeToResponse(Referee referee) {
        return RefereeResponse.builder()
                .id(referee.getId())
                .username(referee.getUsername())
                .email(referee.getEmail())
                .fullName(referee.getFullName())
                .licenseNumber(referee.getLicenseNumber())
                .status(referee.getStatus().name())
                .build();
    }

    private RefereeAssignmentResponse mapAssignmentToResponse(RefereeAssignment assignment) {
        return RefereeAssignmentResponse.builder()
                .id(assignment.getId())
                .raceId(assignment.getRace().getId())
                .raceName(assignment.getRace().getName())
                .refereeId(assignment.getReferee().getId())
                .refereeName(assignment.getReferee().getFullName())
                .refereeEmail(assignment.getReferee().getEmail())
                .licenseNumber(assignment.getReferee().getLicenseNumber())
                .build();
    }
}
