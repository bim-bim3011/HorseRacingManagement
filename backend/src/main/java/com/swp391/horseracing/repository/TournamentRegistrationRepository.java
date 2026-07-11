package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.TournamentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Integer> {
    boolean existsByTournamentIdAndHorseId(Integer tournamentId, Integer horseId);

    List<TournamentRegistration> findByTournamentId(Integer tournamentId);

    List<TournamentRegistration> findByHorseId(Integer horseId);

    List<TournamentRegistration> findByTournamentIdAndOwnerId(Integer tournamentId, Integer ownerId);

    boolean existsByIdAndTournamentId(Integer id, Integer tournamentId);

    int countByTournamentIdAndStatusAndIsReserve(Integer tournamentId, TournamentRegistration.RegistrationStatus status, Boolean isReserve);

    Optional<TournamentRegistration> findFirstByTournamentIdAndStatusAndIsReserveOrderByReserveOrderAsc(
            Integer tournamentId, TournamentRegistration.RegistrationStatus status, Boolean isReserve);


}
