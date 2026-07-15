package com.swp391.horseracing.module.jockey.service.impl;

import com.swp391.horseracing.module.horse.repository.HorseOwnerRepository;
import com.swp391.horseracing.module.horse.repository.HorseRepository;
import com.swp391.horseracing.module.jockey.dto.request.JockeyInvitationRequest;
import com.swp391.horseracing.module.jockey.dto.response.JockeyInvitationResponse;
import com.swp391.horseracing.module.jockey.dto.response.JockeyResponse;
import com.swp391.horseracing.module.jockey.repository.JockeyInvitationRepository;
import com.swp391.horseracing.module.jockey.repository.JockeyRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.horse.entity.horse.Horse;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import com.swp391.horseracing.module.jockey.entity.profile.Jockey;
import com.swp391.horseracing.module.jockey.entity.tournament.JockeyInvitation;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.module.tournament.entity.tournament.Tournament;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.jockey.service.JockeyInvitationService;
import com.swp391.horseracing.module.race.service.RaceEntryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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
    RaceEntryService raceEntryService;

    @Override
    public JockeyInvitationResponse sendInvitation(JockeyInvitationRequest request) {
        HorseOwner owner = getCurrentOwner();

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new AppException(ErrorCode.RACE_NOT_FOUND));

        if (race.getStatus() != Race.RaceStatus.scheduled && race.getStatus() != Race.RaceStatus.checking) {
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
        Tournament tournament = race.getTournament();
        if (jockey.getWeight() != null && tournament.getWeightLimit() != null
                && jockey.getWeight() > tournament.getWeightLimit()) {
            throw new AppException(ErrorCode.JOCKEY_WEIGHT_EXCEEDS_LIMIT);
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

        raceEntryService.assignJockey(invitation.getRace().getId(), invitation.getHorse().getId(), invitation.getJockey());
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

    @Override
    public Page<JockeyResponse> getAvailableJockeysPaginated(String keyword, String gender, Integer minExperience, Float maxWeight, String sortBy, String sortDir, int page, int size) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return jockeyRepository.findAvailableJockeysWithFilters(Jockey.JockeyStatus.approval, keyword, gender, minExperience, maxWeight, pageable)
                .map(this::mapToJockeyResponse);
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
                .height(jockey.getHeight())
                .build();
    }
}
