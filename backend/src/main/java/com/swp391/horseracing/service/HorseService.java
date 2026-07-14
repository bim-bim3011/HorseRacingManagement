package com.swp391.horseracing.service;

import com.swp391.horseracing.dto.request.HorseCreationRequest;
import com.swp391.horseracing.dto.response.HorseResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HorseService {
    HorseResponse createHorse(HorseCreationRequest request, MultipartFile certificate);
    HorseResponse getHorse(Integer id);
    HorseResponse updateHorse(Integer id, HorseCreationRequest request, MultipartFile certificate);
    void deleteHorse(Integer id);
    List<HorseResponse> getMyHorses();
    String uploadCertificate(Integer id, MultipartFile file);
    void approveHorse(Integer id);
    void rejectHorse(Integer id);
    List<HorseResponse> getPendingHorses();
}
