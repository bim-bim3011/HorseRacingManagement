package com.swp391.horseracing.module.horse.service;

import com.swp391.horseracing.module.horse.dto.request.HorseCreationRequest;
import com.swp391.horseracing.module.horse.dto.response.HorseResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import org.springframework.data.domain.Page;
import com.swp391.horseracing.module.horse.entity.horse.Horse.HorseStatus;

public interface HorseService {
    HorseResponse createHorse(HorseCreationRequest request, MultipartFile certificate);
    HorseResponse getHorse(Integer id);
    HorseResponse updateHorse(Integer id, HorseCreationRequest request, MultipartFile certificate);
    void deleteHorse(Integer id);
    List<HorseResponse> getMyHorses();
    Page<HorseResponse> getMyHorses(String keyword, HorseStatus status, String gender, int page, int size, String sortBy, String sortDir);
    String uploadCertificate(Integer id, MultipartFile file);
    void approveHorse(Integer id);
    void rejectHorse(Integer id);
    List<HorseResponse> getPendingHorses();
    com.swp391.horseracing.module.horse.dto.response.HorseProfileResponse getHorseProfile(Integer id);
}
