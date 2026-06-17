package com.swp391.horseracing.service.impl;


import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.repository.RaceRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RaceScheduler {//class này tự động sau khi race sang chế độ checking thì nó canh đúng h đua đổi sang status racing cho race
    RaceRepository raceRepository;

    @Scheduled(fixedRate = 60000)//1 phút 1 tự động sau khi áp chạy 1 lần
    public void autoStartRaces() {
        LocalDateTime now = LocalDateTime.now();
        List<Race> races = raceRepository.findByStatusAndRaceDatetimeBefore(
                Race.RaceStatus.checking, now
        );
        races.forEach(race -> {
            race.setStatus(Race.RaceStatus.racing);
            raceRepository.save(race);
        });
    }


}
