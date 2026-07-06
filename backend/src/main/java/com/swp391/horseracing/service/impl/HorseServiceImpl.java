package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.HorseCreationRequest;
import com.swp391.horseracing.dto.response.HorseResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.entity.Notification;
import com.swp391.horseracing.repository.HorseOwnerRepository;
import com.swp391.horseracing.repository.HorseRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.CloudinaryService;
import com.swp391.horseracing.service.HorseService;
import com.swp391.horseracing.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
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
}
