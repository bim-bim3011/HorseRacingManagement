package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.response.TournamentResponse;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.TournamentRepository;
import com.swp391.horseracing.service.CloudinaryService;
import com.swp391.horseracing.service.TournamentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TournamentServiceImpl implements TournamentService {
    TournamentRepository tournamentRepository;
    CloudinaryService cloudinaryService;

    @Override
    public TournamentResponse createTournament(TournamentRequest request, MultipartFile banner) {
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new AppException(ErrorCode.TOURNAMENT_START_DATE_IN_PAST);
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.TOURNAMENT_INVALID_DATE_RANGE);
        }

        boolean isOverlap = tournamentRepository.existsOverlapping(
                request.getStartDate(), request.getEndDate());

        if (isOverlap) {
            throw new AppException(ErrorCode.TOURNAMENT_DATE_OVERLAP);
        }

        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .weightLimit(request.getWeightLimit())
                .minHorseAge(request.getMinHorseAge())
                .maxHorseAge(request.getMaxHorseAge())
                .allowedBreed(request.getAllowedBreed())
                .registrationStart(request.getRegistrationStart())
                .registrationEnd(request.getRegistrationEnd())
                .prizePool(request.getPrizePool())
                .build();

        if (banner != null && !banner.isEmpty()) {
            String url = cloudinaryService.uploadFile(banner, "EliteDerbyCloud/Tournament");
            tournament.setBannerUrl(url);
        }

        tournamentRepository.save(tournament);
        return mapToResponse(tournament);
    }

    @Override
    public TournamentResponse getTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        return mapToResponse(tournament);
    }

    @Override
    public TournamentResponse updateTournament(Integer id, TournamentRequest request, MultipartFile banner) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));

        tournament.setName(request.getName());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setWeightLimit(request.getWeightLimit());
        tournament.setMinHorseAge(request.getMinHorseAge());
        tournament.setMaxHorseAge(request.getMaxHorseAge());
        tournament.setAllowedBreed(request.getAllowedBreed());
        tournament.setRegistrationStart(request.getRegistrationStart());
        tournament.setRegistrationEnd(request.getRegistrationEnd());
        tournament.setPrizePool(request.getPrizePool());

        if (banner != null && !banner.isEmpty()) {
            String url = cloudinaryService.uploadFile(banner, "EliteDerbyCloud/Tournament");
            tournament.setBannerUrl(url);
        }

        tournamentRepository.save(tournament);
        return mapToResponse(tournament);
    }

    @Override
    public void deleteTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOURNAMENT_NOT_FOUND));
        tournamentRepository.delete(tournament);
    }

    @Override
    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private TournamentResponse mapToResponse(Tournament tournament) {
        return TournamentResponse.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .startDate(tournament.getStartDate())
                .endDate(tournament.getEndDate())
                .status(tournament.getStatus().name())
                .weightLimit(tournament.getWeightLimit())
                .minHorseAge(tournament.getMinHorseAge())
                .maxHorseAge(tournament.getMaxHorseAge())
                .allowedBreed(tournament.getAllowedBreed())
                .registrationStart(tournament.getRegistrationStart())
                .registrationEnd(tournament.getRegistrationEnd())
                .prizePool(tournament.getPrizePool())
                .bannerUrl(tournament.getBannerUrl())
                .build();
    }
}
