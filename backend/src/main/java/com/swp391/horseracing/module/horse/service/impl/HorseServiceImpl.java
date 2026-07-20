package com.swp391.horseracing.module.horse.service.impl;

import com.swp391.horseracing.module.horse.dto.request.HorseCreationRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseResponse;
import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.horse.entity.horse.Horse;
import com.swp391.horseracing.module.horse.entity.profile.HorseOwner;
import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.notification.entity.Notification;
import com.swp391.horseracing.module.horse.repository.HorseOwnerRepository;
import com.swp391.horseracing.module.horse.repository.HorseRepository;
import com.swp391.horseracing.module.user.repository.UserRepository;
import com.swp391.horseracing.module.common.service.CloudinaryService;
import com.swp391.horseracing.module.horse.service.HorseService;
import com.swp391.horseracing.module.notification.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HorseServiceImpl implements HorseService {
    HorseRepository horseRepository;
    HorseOwnerRepository horseOwnerRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;
    NotificationService notificationService;

    @Override
    public HorseResponse createHorse(HorseCreationRequest request, MultipartFile certificate) {
        HorseOwner owner = getCurrentOwner();


        if (horseRepository.existsByNameAndOwnerId(request.getName(), owner.getId())) {
            throw new AppException(ErrorCode.HORSE_ALREADY_EXISTS);
        }

        String certificateUrl = null;
        if (certificate != null && !certificate.isEmpty()) {
            certificateUrl = cloudinaryService.uploadFile(certificate, "EliteDerbyCloud/Horse");
        }

        Horse horse = Horse.builder()
                .owner(owner)
                .name(request.getName())
                .horseCode(request.getHorseCode())
                .breed(request.getBreed())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .height(request.getHeight())
                .weight(request.getWeight())
                .healthStatus(request.getHealthStatus())
                .healthCertificateUrl(certificateUrl)
                .build();

        horseRepository.save(horse);
        return mapToResponse(horse);
    }

    @Override
    public HorseResponse getHorse(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));
        return mapToResponse(horse);
    }

    @Override
    public HorseResponse updateHorse(Integer id, HorseCreationRequest request, MultipartFile certificate) {
        HorseOwner owner = getCurrentOwner();


        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));


        validateOwnership(horse, owner);

        if (certificate != null && !certificate.isEmpty()) {
            String certificateUrl = cloudinaryService.uploadFile(certificate, "EliteDerbyCloud/Horse");
            horse.setHealthCertificateUrl(certificateUrl);
        }

        horse.setName(request.getName());
        horse.setHorseCode(request.getHorseCode());
        horse.setBreed(request.getBreed());
        horse.setGender(request.getGender());
        horse.setDateOfBirth(request.getDateOfBirth());
        horse.setHeight(request.getHeight());
        horse.setWeight(request.getWeight());
        horse.setHealthStatus(request.getHealthStatus());

        return mapToResponse(horseRepository.save(horse));
    }

    @Override
    public void deleteHorse(Integer id) {

        HorseOwner owner = getCurrentOwner();

        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        validateOwnership(horse, owner);

        horseRepository.delete(horse);
    }

    @Override
    public List<HorseResponse> getMyHorses() {
        HorseOwner owner = getCurrentOwner();
        return horseRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<HorseResponse> getMyHorses(String keyword, Horse.HorseStatus status, String gender, int page, int size, String sortBy, String sortDir) {
        HorseOwner owner = getCurrentOwner();
        
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
                
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return horseRepository.findMyHorsesWithFilters(owner.getId(), keyword, status, gender, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public String uploadCertificate(Integer id, MultipartFile file) {

        HorseOwner owner = getCurrentOwner();


        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));


        validateOwnership(horse, owner);

        String url = cloudinaryService.uploadFile(file, "EliteDerbyCloud/Horse");
        horse.setHealthCertificateUrl(url);
        horseRepository.save(horse);
        return url;
    }

    @Override
    public void approveHorse(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        if (horse.getHealthCertificateUrl() == null) {
            throw new AppException(ErrorCode.HORSE_MISSING_CERTIFICATE);
        }
        horse.setStatus(Horse.HorseStatus.active);
        horseRepository.save(horse);

        notificationService.sendNotification(
            horse.getOwner(),
            Notification.NotificationType.HORSE_APPROVED,
            "Horse Approved",
            "Your horse " + horse.getName() + " has been approved by the Admin and is now active."
        );
    }

    @Override
    public void rejectHorse(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));
        horse.setStatus(Horse.HorseStatus.rejected);
        horseRepository.save(horse);

        notificationService.sendNotification(
            horse.getOwner(),
            Notification.NotificationType.HORSE_REJECTED,
            "Horse Rejected",
            "Your horse " + horse.getName() + " has been rejected by the Admin."
        );
    }
    @Override
    public List<HorseResponse> getPendingHorses() {
        return horseRepository.findByStatus(Horse.HorseStatus.inactive)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private HorseResponse mapToResponse(Horse horse) {
        return HorseResponse.builder()
                .id(horse.getId())
                .horseCode(horse.getHorseCode())
                .name(horse.getName())
                .breed(horse.getBreed())
                .gender(horse.getGender())
                .dateOfBirth(horse.getDateOfBirth())
                .height(horse.getHeight())
                .weight(horse.getWeight())
                .healthStatus(horse.getHealthStatus())
                .healthCertificateUrl(horse.getHealthCertificateUrl())
                .status(horse.getStatus().name())
                .ownerName(horse.getOwner() != null ? horse.getOwner().getFullName() : null)
                .build();
    }

    private HorseOwner getCurrentOwner() {

        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return horseOwnerRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_HORSE_OWNER));
    }
    private void validateOwnership(Horse horse, HorseOwner owner) {
        if (!horse.getOwner().getId().equals(owner.getId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.swp391.horseracing.module.horse.dto.response.HorseProfileResponse getHorseProfile(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));

        List<com.swp391.horseracing.module.race.entity.tournament.RaceEntry> raceEntries = horse.getRaceEntries();
        if (raceEntries == null) {
            raceEntries = java.util.Collections.emptyList();
        }

        List<com.swp391.horseracing.module.horse.dto.response.RaceHistoryDto> raceHistory = new java.util.ArrayList<>();
        List<com.swp391.horseracing.module.horse.dto.response.ViolationDto> violationHistory = new java.util.ArrayList<>();

        int totalRaces = raceEntries.size();
        int winCount = 0;
        int top3Count = 0;
        int totalViolations = 0;

        for (com.swp391.horseracing.module.race.entity.tournament.RaceEntry entry : raceEntries) {
            Integer rank = null;
            if (entry.getResult() != null) {
                rank = entry.getResult().getPosition();
                if (rank != null && rank == 1) winCount++;
                if (rank != null && rank <= 3) top3Count++;
            }

            raceHistory.add(com.swp391.horseracing.module.horse.dto.response.RaceHistoryDto.builder()
                    .raceId(entry.getRace().getId())
                    .tournamentName(entry.getRace().getTournament().getName())
                    .raceName(entry.getRace().getName())
                    .raceDate(entry.getRace().getRaceDatetime() != null ? entry.getRace().getRaceDatetime() : null)
                    .jockeyName(entry.getJockey() != null ? entry.getJockey().getFullName() : null)
                    .laneNumber(entry.getLaneNumber())
                    .rank(rank)
                    .status(entry.getStatus().name())
                    .build());

            if (entry.getViolations() != null && !entry.getViolations().isEmpty()) {
                totalViolations += entry.getViolations().size();
                for (com.swp391.horseracing.module.common.entity.result.Violation v : entry.getViolations()) {
                    violationHistory.add(com.swp391.horseracing.module.horse.dto.response.ViolationDto.builder()
                            .raceName(entry.getRace().getName())
                            .tournamentName(entry.getRace().getTournament().getName())
                            .description(v.getDescription())
                            .penaltyRuleType(v.getPenaltyRule() != null ? v.getPenaltyRule().getViolationType() : null)
                            .build());
                }
            }
        }

        double winRate = totalRaces > 0 ? (double) winCount / totalRaces * 100 : 0.0;
        double top3Rate = totalRaces > 0 ? (double) top3Count / totalRaces * 100 : 0.0;

        return com.swp391.horseracing.module.horse.dto.response.HorseProfileResponse.builder()
                .id(horse.getId())
                .name(horse.getName())
                .breed(horse.getBreed())
                .horseCode(horse.getHorseCode())
                .gender(horse.getGender())
                .dateOfBirth(horse.getDateOfBirth())
                .height(horse.getHeight())
                .weight(horse.getWeight())
                .healthStatus(horse.getHealthStatus())
                .healthCertificateUrl(horse.getHealthCertificateUrl())
                .status(horse.getStatus().name())
                .ownerName(horse.getOwner() != null ? horse.getOwner().getFullName() : null)
                .totalRaces(totalRaces)
                .winRate(winRate)
                .top3Rate(top3Rate)
                .totalViolations(totalViolations)
                .raceHistory(raceHistory)
                .violations(violationHistory)
                .build();
    }
}
