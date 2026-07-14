package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.dto.response.realtime.HorseTickState;
import com.swp391.horseracing.dto.response.realtime.RaceMessage;
import com.swp391.horseracing.dto.response.realtime.RaceSnapshotResponse;
import com.swp391.horseracing.entity.tournament.Race;
import com.swp391.horseracing.entity.tournament.RaceEntry;
import com.swp391.horseracing.repository.RaceEntryRepository;
import com.swp391.horseracing.repository.RaceRepository;
import com.swp391.horseracing.repository.RaceResultRepository;
import com.swp391.horseracing.entity.result.RaceResult;
import com.swp391.horseracing.entity.tournament.Race.RaceStatus;
import com.swp391.horseracing.service.RaceSimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class RaceSimulationServiceImpl implements RaceSimulationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final StringRedisTemplate redisTemplate;
    private final RaceRepository raceRepository;
    private final RaceEntryRepository raceEntryRepository;
    private final RaceResultRepository raceResultRepository;
    private final ThreadPoolTaskScheduler taskScheduler;



    private final Map<Integer, ScheduledFuture<?>> runningRaces = new ConcurrentHashMap<>();

    @Override
    public void startRace(Integer raceId) {
        if (runningRaces.containsKey(raceId)) {
            throw new RuntimeException("Race is already running");
        }

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        List<RaceEntry> allEntries = raceEntryRepository.findByRaceId(raceId);
        List<RaceEntry> entries = allEntries != null ? allEntries.stream()
                .filter(e -> e.getStatus() == RaceEntry.EntryStatus.approved)
                .toList() : List.of();

        if (entries.isEmpty()) {
            throw new RuntimeException("No approved entries found for this race");
        }

        initializeRedisRaceState(race, entries);

        Integer tournamentId = race.getTournament().getId();

        ScheduledFuture<?> future = taskScheduler.scheduleAtFixedRate(
                () -> simulateTick(tournamentId, raceId),
                300
        );

        runningRaces.put(raceId, future);
    }

    @Override
    public void pauseRace(Integer raceId) {
        String metaKey = "race:" + raceId + ":meta";
        redisTemplate.opsForHash().put(metaKey, "status", "PAUSED");
    }

    @Override
    public void resumeRace(Integer raceId) {
        String metaKey = "race:" + raceId + ":meta";
        redisTemplate.opsForHash().put(metaKey, "status", "RUNNING");
    }

    @Override
    public void stopRace(Integer raceId) {
        ScheduledFuture<?> future = runningRaces.remove(raceId);
        if (future != null) {
            future.cancel(false);
        }
    }

    private void simulateTick(Integer tournamentId, Integer raceId) {
        try {
            String metaKey = "race:" + raceId + ":meta";
            String positionKey = "race:" + raceId + ":positions";

            String status = (String) redisTemplate.opsForHash().get(metaKey, "status");
            if (!"RUNNING".equals(status)) {
                return;
            }

            double distance = Double.parseDouble(
                    (String) redisTemplate.opsForHash().get(metaKey, "distance")
            );

            Set<String> horseIds = redisTemplate.opsForZSet().range(positionKey, 0, -1);
            if (horseIds == null || horseIds.isEmpty()) {
                return;
            }

            boolean allFinished = true;

            for (String horseIdStr : horseIds) {
                String horseKey = "race:" + raceId + ":horse:" + horseIdStr;

                boolean finished = Boolean.parseBoolean(
                        String.valueOf(redisTemplate.opsForHash().get(horseKey, "finished"))
                );

                if (finished) {
                    continue;
                }

                allFinished = false;

                double progress = Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "progress")));
                double speed = Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "speed")));
                double stamina = Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "stamina")));

                // Random events (Drama)
                String effect = "NORMAL";
                double randomEvent = Math.random();
                if (randomEvent < 0.02) {
                    effect = "STUMBLED";
                    speed = speed * 0.2; // Giảm tốc mạnh
                } else if (randomEvent < 0.05) {
                    effect = "BURST";
                    speed = speed * 1.5; // Hưng phấn
                } else {
                    // Sprint logic cuối chặng
                    if (progress > distance * 0.8) {
                        if (stamina > 30) {
                            effect = "SPRINTING";
                            speed = speed * 1.4;
                        } else if (stamina < 10) {
                            effect = "EXHAUSTED";
                            speed = speed * 0.6;
                        }
                    }
                }

                // Random factor
                double randomFactor = 0.85 + Math.random() * 0.3; // 0.85 -> 1.15
                
                // Tick 300ms = 0.3s
                double tickSpeed = speed * randomFactor * 0.3;
                
                double newProgress = progress + tickSpeed;
                double newStamina = Math.max(0, stamina - (speed * 0.1)); // stamina drain

                if (newProgress >= distance) {
                    newProgress = distance;
                    redisTemplate.opsForHash().put(horseKey, "finished", "true");
                    redisTemplate.opsForHash().put(horseKey, "finishTime", String.valueOf(System.currentTimeMillis()));

                    // Xử lý hạng về đích
                    double overDistance = newProgress - distance;
                    long finishScore = System.currentTimeMillis() - (long) (overDistance * 1000); 
                    
                    redisTemplate.opsForZSet().add("race:" + raceId + ":finishOrder", horseIdStr, finishScore);
                }

                redisTemplate.opsForHash().put(horseKey, "progress", String.valueOf(newProgress));
                redisTemplate.opsForHash().put(horseKey, "stamina", String.valueOf(newStamina));
                
                redisTemplate.opsForHash().put(horseKey, "effect", effect);
                
                redisTemplate.opsForZSet().add(positionKey, horseIdStr, newProgress);
            }

            RaceSnapshotResponse snapshot = getRaceState(raceId);
            RaceMessage<RaceSnapshotResponse> message = new RaceMessage<>("TICK", snapshot);
            
            messagingTemplate.convertAndSend("/topic/tournaments/" + tournamentId + "/races/" + raceId, message);

            if (allFinished) {
                finishRace(tournamentId, raceId);
            }
        } catch (Exception e) {
            log.error("Error in simulateTick for raceId: {}", raceId, e);
        }
    }

    private void finishRace(Integer tournamentId, Integer raceId) {
        stopRace(raceId);
        
        String metaKey = "race:" + raceId + ":meta";
        redisTemplate.opsForHash().put(metaKey, "status", "FINISHED");
        
        RaceSnapshotResponse snapshot = getRaceState(raceId);
        snapshot.setStatus("FINISHED");
        RaceMessage<RaceSnapshotResponse> message = new RaceMessage<>("FINISHED", snapshot);
        messagingTemplate.convertAndSend("/topic/tournaments/" + tournamentId + "/races/" + raceId, message);
        
        // Lưu dữ liệu vào DB
        Race race = raceRepository.findById(raceId).orElse(null);
        if (race != null) {
            race.setStatus(RaceStatus.finished);
            race.setEndedAt(LocalDateTime.now());
            raceRepository.save(race);

            Set<ZSetOperations.TypedTuple<String>> finishOrder = 
                    redisTemplate.opsForZSet().rangeWithScores("race:" + raceId + ":finishOrder", 0, -1);
            
            if (finishOrder != null) {
                int rank = 1;
                for (ZSetOperations.TypedTuple<String> tuple : finishOrder) {
                    Integer horseId = Integer.valueOf(tuple.getValue());
                    RaceEntry entry = raceEntryRepository.findByRaceIdAndHorseId(raceId, horseId).orElse(null);
                    if (entry != null) {
                        RaceResult result = RaceResult.builder()
                                .entry(entry)
                                .position(rank)
                                .build();
                        raceResultRepository.save(result);
                    }
                    rank++;
                }
            }
        }
        
        // Dọn dẹp RAM (Redis Cleanup)
        String positionKey = "race:" + raceId + ":positions";
        String finishOrderKey = "race:" + raceId + ":finishOrder";
        Set<String> horseIds = redisTemplate.opsForZSet().range(positionKey, 0, -1);
        if (horseIds != null) {
            for(String horseId : horseIds) {
                redisTemplate.delete("race:" + raceId + ":horse:" + horseId);
            }
        }
        redisTemplate.delete(metaKey);
        redisTemplate.delete(positionKey);
        redisTemplate.delete(finishOrderKey);
    }

    private void initializeRedisRaceState(Race race, List<RaceEntry> entries) {
        Integer raceId = race.getId();

        String metaKey = "race:" + raceId + ":meta";
        String positionKey = "race:" + raceId + ":positions";

        redisTemplate.opsForHash().put(metaKey, "status", "RUNNING");
        redisTemplate.opsForHash().put(metaKey, "distance", String.valueOf(race.getDistance()));
        redisTemplate.opsForHash().put(metaKey, "startedAt", LocalDateTime.now().toString());

        int lane = 1;

        for (RaceEntry entry : entries) {
            Long horseId = entry.getHorse().getId().longValue();

            String horseKey = "race:" + raceId + ":horse:" + horseId;

            double baseSpeed = 12 + Math.random() * 8; // 12 -> 20
            double stamina = 70 + Math.random() * 30; // 70 -> 100

            // Lưu các field tĩnh vào redis (để API REST đọc)
            redisTemplate.opsForHash().put(horseKey, "horseName", entry.getHorse().getName());
            if (entry.getJockey() != null) {
                redisTemplate.opsForHash().put(horseKey, "jockeyId", String.valueOf(entry.getJockey().getId()));
                redisTemplate.opsForHash().put(horseKey, "jockeyName", entry.getJockey().getFullName());
            }
            redisTemplate.opsForHash().put(horseKey, "lane", String.valueOf(lane));
            
            // Lưu các field động
            redisTemplate.opsForHash().put(horseKey, "progress", "0");
            redisTemplate.opsForHash().put(horseKey, "speed", String.valueOf(baseSpeed));
            redisTemplate.opsForHash().put(horseKey, "stamina", String.valueOf(stamina));
            redisTemplate.opsForHash().put(horseKey, "finished", "false");
            redisTemplate.opsForHash().put(horseKey, "effect", "NORMAL");
            redisTemplate.opsForHash().put(horseKey, "isFlagged", "false");

            redisTemplate.opsForZSet().add(positionKey, String.valueOf(horseId), 0);

            lane++;
        }
    }

    @Override
    public RaceSnapshotResponse getRaceState(Integer raceId) {
        String metaKey = "race:" + raceId + ":meta";
        String positionKey = "race:" + raceId + ":positions";

        Object distanceObj = redisTemplate.opsForHash().get(metaKey, "distance");
        if (distanceObj == null) {
            // Chưa có trong Redis (chưa start), lấy từ DB
            Race race = raceRepository.findById(raceId)
                    .orElseThrow(() -> new RuntimeException("Race not found"));
                    
            List<RaceEntry> entries = raceEntryRepository.findByRaceId(raceId);
            List<HorseTickState> initialHorses = new ArrayList<>();
            if (entries != null) {
                int lane = 1;
                for (RaceEntry entry : entries) {
                    if (entry.getStatus() == RaceEntry.EntryStatus.approved) {
                        initialHorses.add(HorseTickState.builder()
                                .horseId(entry.getHorse().getId().longValue())
                                .progress(0.0)
                                .speed(0.0)
                                .stamina(100.0)
                                .rank(0)
                                .effect("NORMAL")
                                .finished(false)
                                .build());
                    }
                }
            }
            
            return RaceSnapshotResponse.builder()
                    .status(race.getStatus() != null ? race.getStatus().name() : "NOT STARTED")
                    .distance(race.getDistance() != null ? race.getDistance().doubleValue() : 1000.0)
                    .tick(0)
                    .horses(initialHorses)
                    .build();
        }

        double distance = 1000;
        try {
            distance = Double.parseDouble(String.valueOf(distanceObj));
        } catch (NumberFormatException e) {
            distance = 1000;
        }

        String status = String.valueOf(redisTemplate.opsForHash().get(metaKey, "status"));

        Set<ZSetOperations.TypedTuple<String>> ranking =
                redisTemplate.opsForZSet().reverseRangeWithScores(positionKey, 0, -1);

        List<HorseTickState> horses = new ArrayList<>();

        int rank = 1;

        if (ranking != null) {
            for (ZSetOperations.TypedTuple<String> item : ranking) {
                String horseId = item.getValue();
                String horseKey = "race:" + raceId + ":horse:" + horseId;
                
                Object effectObj = redisTemplate.opsForHash().get(horseKey, "effect");
                String effect = effectObj != null ? String.valueOf(effectObj) : "NORMAL";

                Object isFlaggedObj = redisTemplate.opsForHash().get(horseKey, "isFlagged");
                boolean isFlagged = isFlaggedObj != null ? Boolean.parseBoolean(String.valueOf(isFlaggedObj)) : false;

                HorseTickState state = HorseTickState.builder()
                        .horseId(Long.valueOf(horseId))
                        .progress(Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "progress"))))
                        .speed(Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "speed"))))
                        .stamina(Double.parseDouble(String.valueOf(redisTemplate.opsForHash().get(horseKey, "stamina"))))
                        .rank(rank)
                        .finished(Boolean.parseBoolean(String.valueOf(redisTemplate.opsForHash().get(horseKey, "finished"))))
                        .effect(effect)
                        .isFlagged(isFlagged)
                        .build();

                horses.add(state);
                rank++;
            }
        }

        return RaceSnapshotResponse.builder()
                .raceId(raceId)
                .status(status)
                .distance(distance)
                .tick(System.currentTimeMillis())
                .horses(horses)
                .build();
    }

    @Override
    public void flagHorse(Integer raceId, Integer horseId, String refereeUsername) {
        String metaKey = "race:" + raceId + ":meta";
        String status = (String) redisTemplate.opsForHash().get(metaKey, "status");
        if (!"RUNNING".equals(status)) {
            throw new RuntimeException("Race is not running");
        }

        String horseKey = "race:" + raceId + ":horse:" + horseId;
        Object horseExists = redisTemplate.opsForHash().get(horseKey, "horseName");
        if (horseExists == null) {
            throw new RuntimeException("Horse not found in race");
        }

        // Set isFlagged for realtime visual effect
        redisTemplate.opsForHash().put(horseKey, "isFlagged", "true");

        // Save flag event
        String flagsKey = "race:" + raceId + ":flags";
        String flagJson = String.format("{\"referee\":\"%s\", \"horseId\":%d, \"timestamp\":%d}", 
                                        refereeUsername, horseId, System.currentTimeMillis());
        redisTemplate.opsForList().rightPush(flagsKey, flagJson);
    }
}
