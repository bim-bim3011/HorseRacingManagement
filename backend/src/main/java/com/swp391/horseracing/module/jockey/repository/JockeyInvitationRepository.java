package com.swp391.horseracing.module.jockey.repository;

import com.swp391.horseracing.module.jockey.entity.tournament.JockeyInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JockeyInvitationRepository extends JpaRepository<JockeyInvitation , Integer> {

    boolean existsByRaceIdAndHorseIdAndJockeyId(Integer raceId, Integer horseId, Integer jockeyId);


    boolean existsByRaceIdAndJockeyIdAndStatus(Integer raceId, Integer jockeyId, JockeyInvitation.InvitationStatus status);

    boolean existsByRaceIdAndHorseIdAndStatus(Integer raceId, Integer horseId, JockeyInvitation.InvitationStatus status);

    List<JockeyInvitation> findByHorseId(Integer horseId);

    List<JockeyInvitation> findByJockeyId(Integer jockeyId);

    List<JockeyInvitation> findByRaceIdAndHorseId(Integer raceId, Integer horseId);

    List<JockeyInvitation> findByRaceIdAndHorseIdAndStatus(
            Integer raceId, Integer horseId, JockeyInvitation.InvitationStatus status);
}
