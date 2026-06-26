package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.JockeyInvitationRequest;
import com.swp391.horseracing.dto.response.JockeyInvitationResponse;
import com.swp391.horseracing.dto.response.JockeyResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.profile.Jockey;
import com.swp391.horseracing.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.*;
import com.swp391.horseracing.service.JockeyInvitationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JockeyInvitationServiceImpl implements JockeyInvitationService {

    JockeyInvitationRepository jockeyInvitationRepository;
    JockeyRepository jockeyRepository;
    RaceRepository raceRepository;
    HorseRepository horseRepository;
    HorseOwnerRepository horseOwnerRepository;
    UserRepository userRepository;
    RaceEntryRepository raceEntryRepository;

    @Override
    public JockeyInvitationResponse sendInvitation(JockeyInvitationRequest request) {
        HorseOwner owner = getCurrentOwner();

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (race.getStatus() != Race.RaceStatus.checking) {
            throw new AppException(ErrorCode.RACE_NOT_AVAILABLE);
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        boolean isApprovedEntry = horse.getRaceEntries().stream()
                .anyMatch(entry -> entry.getRace().getId().equals(race.getId())
                        && entry.getStatus() == RaceEntry.EntryStatus.approved);

        if (!isApprovedEntry) {
            throw new AppException(ErrorCode.HORSE_ENTRY_NOT_APPROVED);
        }
        Jockey jockey = jockeyRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new AppException(ErrorCode.JOCKEY_NOT_FOUND));

        if (jockey.getJockeyStatus() != Jockey.JockeyStatus.approval) {
            throw new AppException(ErrorCode.JOCKEY_NOT_APPROVED);
        }

        if (jockeyInvitationRepository.existsByRaceIdAndHorseIdAndStatus(
                request.getRaceId(), request.getHorseId(), JockeyInvitation.InvitationStatus.accepted)) {
            throw new AppException(ErrorCode.HORSE_ALREADY_HAS_JOCKEY);
        }

        if (jockeyInvitationRepository.existsByRaceIdAndHorseIdAndJockeyId(
                request.getRaceId(), request.getHorseId(), request.getJockeyId())) {
            throw new AppException(ErrorCode.INVITATION_ALREADY_EXISTS);
        }

        if (jockeyInvitationRepository.existsByRaceIdAndJockeyIdAndStatus(
                request.getRaceId(), request.getJockeyId(), JockeyInvitation.InvitationStatus.accepted)) {
            throw new AppException(ErrorCode.JOCKEY_ALREADY_ASSIGNED);
        }

        JockeyInvitation invitation = JockeyInvitation.builder()
                .race(race)
                .horse(horse)
                .jockey(jockey)
                .build();

        jockeyInvitationRepository.save(invitation);
        return mapToResponse(invitation);
    }

    @Override
    public List<JockeyInvitationResponse> getInvitationsByHorse(Integer horseId) { //owner watch Invitations send
        HorseOwner owner = getCurrentOwner();

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));


        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return jockeyInvitationRepository.findByHorseId(horseId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<JockeyInvitationResponse> getMyInvitations() { //jockey watch Invitations send it
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        jockeyRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_JOCKEY));
        return jockeyInvitationRepository.findByJockeyId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void acceptInvitation(Integer id) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        jockeyRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_JOCKEY));
        JockeyInvitation invitation = jockeyInvitationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND));
        if (!invitation.getJockey().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        invitation.setStatus(JockeyInvitation.InvitationStatus.accepted);
        jockeyInvitationRepository.save(invitation);

        List<JockeyInvitation> others = jockeyInvitationRepository
                .findByRaceIdAndHorseIdAndStatus(
                        invitation.getRace().getId(),
                        invitation.getHorse().getId(),
                        JockeyInvitation.InvitationStatus.pending);

        others.forEach(inv -> {
            if (!inv.getId().equals(id)) {
                inv.setStatus(JockeyInvitation.InvitationStatus.declined);
                jockeyInvitationRepository.save(inv);
            }
        });

        RaceEntry entry = invitation.getHorse().getRaceEntries().stream()
                .filter(e -> e.getRace().getId().equals(invitation.getRace().getId()))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.RACE_ENTRY_NOT_FOUND));

        entry.setJockey(invitation.getJockey());
        raceEntryRepository.save(entry);
    }

    @Override
    public void declineInvitation(Integer id) {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        jockeyRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_JOCKEY));
        JockeyInvitation invitation = jockeyInvitationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INVITATION_NOT_FOUND));
        if (!invitation.getJockey().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        invitation.setStatus(JockeyInvitation.InvitationStatus.declined);
        jockeyInvitationRepository.save(invitation);
    }

    @Override
    public List<JockeyResponse> getAvailableJockeys() {
        return jockeyRepository.findByJockeyStatus(Jockey.JockeyStatus.approval)
                .stream()
                .map(this::mapToJockeyResponse)
                .toList();
    }
    private HorseOwner getCurrentOwner() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return horseOwnerRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_HORSE_OWNER));
    }

    private JockeyInvitationResponse mapToResponse(JockeyInvitation invitation) {
        return JockeyInvitationResponse.builder()
                .id(invitation.getId())
                .raceName(invitation.getRace().getName())
                .horseName(invitation.getHorse().getName())
                .jockeyName(invitation.getJockey().getFullName())
                .status(invitation.getStatus().name())
                .build();
    }

    private JockeyResponse mapToJockeyResponse(Jockey jockey) {
        return JockeyResponse.builder()
                .id(jockey.getId())
                .fullName(jockey.getFullName())
                .weight(jockey.getWeight())
                .experienceYears(jockey.getExperienceYears())

                .build();
    }
}
