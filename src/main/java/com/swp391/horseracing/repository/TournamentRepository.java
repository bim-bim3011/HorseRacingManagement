package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament,Integer> {
    boolean existsByStatusIn(List<Tournament.TournamentStatus> statuses);//kiểm tra xem có trận nào có đang trong trạng thái đang diễn ra hay sắp diễn ra không
}
