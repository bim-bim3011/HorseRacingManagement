package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.request.TournamentRequest;
import com.swp391.horseracing.dto.response.TournamentResponse;
import com.swp391.horseracing.entity.tournament.Tournament;
import com.swp391.horseracing.exception.AppException;
import com.swp391.horseracing.exception.ErrorCode;
import com.swp391.horseracing.repository.TournamentRepository;
import com.swp391.horseracing.service.TournamentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TournamentServiceImpl implements TournamentService {
    TournamentRepository tournamentRepository;

    @Override
    public TournamentResponse createTournament(TournamentRequest request) {
        // Kiểm tra có giải đang upcoming hoặc ongoing chưa
        boolean exists = tournamentRepository.existsByStatusIn(
                List.of(Tournament.TournamentStatus.upcoming,
                        Tournament.TournamentStatus.ongoing)
        );
        if (exists) {
            throw new AppException(ErrorCode.TOURNAMENT_ALREADY_EXISTS);//trong 1 thởi điểm có 1 giải đấu đc diễn ra khi nào giải đó kết thúc thì mới đc tạp giải mới
        }
        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .regulations(request.getRegulations())
                .build();

        tournamentRepository.save(tournament);
        return mapToResponse(tournament);
    }

    @Override
    public TournamentResponse getTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        return mapToResponse(tournament);
    }

    @Override
    public TournamentResponse updateTournament(Integer id, TournamentRequest request) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        tournament.setName(request.getName());
        tournament.setStartDate(request.getStartDate());
        tournament.setEndDate(request.getEndDate());
        tournament.setRegulations(request.getRegulations());

        tournamentRepository.save(tournament);
        return mapToResponse(tournament);
    }

    @Override
    public void deleteTournament(Integer id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
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
                .regulations(tournament.getRegulations())
                .build();
    }
}
