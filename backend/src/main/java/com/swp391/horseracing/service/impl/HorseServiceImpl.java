package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.HorseCreationRequest;
import com.swp391.horseracing.dto.response.HorseResponse;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.entity.horse.Horse;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.HorseOwnerRepository;
import com.swp391.horseracing.repository.HorseRepository;
import com.swp391.horseracing.repository.UserRepository;
import com.swp391.horseracing.service.CloudinaryService;
import com.swp391.horseracing.service.HorseService;
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

    @Override
    public HorseResponse createHorse(HorseCreationRequest request) {
        HorseOwner owner = getCurrentOwner();


        if (horseRepository.existsByNameAndOwnerId(request.getName(), owner.getId())) {
            throw new AppException(ErrorCode.HORSE_ALREADY_EXISTS);
        }

        Horse horse = Horse.builder()
                .owner(owner)
                .name(request.getName())
                .breed(request.getBreed())
                .age(request.getAge())
                .healthStatus(request.getHealthStatus())
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
    public HorseResponse updateHorse(Integer id, HorseCreationRequest request) {
        HorseOwner owner = getCurrentOwner();


        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));


        validateOwnership(horse, owner);

        horse.setName(request.getName());
        horse.setBreed(request.getBreed());
        horse.setAge(request.getAge());
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
    }

    @Override
    public void rejectHorse(Integer id) {
        Horse horse = horseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.HORSE_NOT_FOUND));
        horse.setStatus(Horse.HorseStatus.rejected);
        horseRepository.save(horse);
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
                .name(horse.getName())
                .breed(horse.getBreed())
                .age(horse.getAge())
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
