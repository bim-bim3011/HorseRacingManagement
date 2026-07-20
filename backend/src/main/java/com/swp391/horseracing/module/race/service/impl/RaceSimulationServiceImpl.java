package com.swp391.horseracing.module.race.service.impl;

import com.swp391.horseracing.module.horse.dto.response.realtime.HorseTickState;
import com.swp391.horseracing.module.race.dto.response.realtime.RaceMessage;
import com.swp391.horseracing.module.race.dto.response.realtime.RaceSnapshotResponse;
import com.swp391.horseracing.module.race.entity.tournament.Race;
import com.swp391.horseracing.module.race.entity.tournament.RaceEntry;
import com.swp391.horseracing.module.race.repository.RaceEntryRepository;
import com.swp391.horseracing.module.race.repository.RaceRepository;
import com.swp391.horseracing.module.race.repository.RaceResultRepository;
import com.swp391.horseracing.module.race.entity.result.RaceResult;
import com.swp391.horseracing.module.race.entity.result.RaceIncident;
import com.swp391.horseracing.module.race.dto.response.RaceIncidentResponse;
import com.swp391.horseracing.module.race.service.RaceSimulationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
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
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RaceSimulationServiceImpl implements RaceSimulationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final StringRedisTemplate redisTemplate;
    private final RaceRepository raceRepository;
    private final RaceEntryRepository raceEntryRepository;
    private final RaceResultRepository raceResultRepository;
    private final com.swp391.horseracing.module.race.repository.RaceIncidentRepository raceIncidentRepository;
    private final ObjectMapper objectMapper;
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

    @Override
    public void abortRace(Integer tournamentId, Integer raceId) {
        stopRace(raceId);
        
        String metaKey = "race:" + raceId + ":meta";
        String positionKey = "race:" + raceId + ":positions";
        String finishOrderKey = "race:" + raceId + ":finishOrder";
        String flagsKey = "race:" + raceId + ":flags";
        
        Set<String> horseIds = redisTemplate.opsForZSet().range(positionKey, 0, -1);
        if (horseIds != null) {
            for(String horseId : horseIds) {
                redisTemplate.delete("race:" + raceId + ":horse:" + horseId);
            }
        }
        
        redisTemplate.delete(metaKey);
        redisTemplate.delete(positionKey);
        redisTemplate.delete(finishOrderKey);
        redisTemplate.delete(flagsKey);
        
        RaceSnapshotResponse snapshot = getRaceState(raceId);
        RaceMessage<RaceSnapshotResponse> message = new RaceMessage<>("ABORTED", snapshot);
        messagingTemplate.convertAndSend("/topic/tournaments/" + tournamentId + "/races/" + raceId, message);
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
                    redisTemplate.expire("race:" + raceId + ":finishOrder", 2, TimeUnit.HOURS);
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
            race.setStatus(Race.RaceStatus.finished);
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
        
        // Save incidents from Redis to Database
        String flagsKey = "race:" + raceId + ":flags";
        List<String> flagJsons = redisTemplate.opsForList().range(flagsKey, 0, -1);
        if (flagJsons != null && !flagJsons.isEmpty()) {
            for (String json : flagJsons) {
                try {
                    JsonNode node = objectMapper.readTree(json);
                    String referee = node.get("referee").asText();
                    Integer horseId = node.get("horseId").asInt();
                    Long timestamp = node.get("timestamp").asLong();

                    RaceEntry entry = raceEntryRepository.findByRaceIdAndHorseId(raceId, horseId).orElse(null);
                    if (entry != null) {
                        RaceIncident incident = RaceIncident.builder()
                                .entry(entry)
                                .refereeUsername(referee)
                                .timestamp(timestamp)
                                .build();
                        raceIncidentRepository.save(incident);
                    }
                } catch (Exception e) {
                    log.error("Failed to parse flag event JSON: {}", json, e);
                }
            }
        }
        redisTemplate.delete(flagsKey);
        
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
        
        redisTemplate.expire(metaKey, 2, TimeUnit.HOURS);
        redisTemplate.expire(positionKey, 2, TimeUnit.HOURS);

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
            redisTemplate.expire(horseKey, 2, TimeUnit.HOURS);

            lane++;
        }
    }

    @Override
    public RaceSnapshotResponse getRaceState(Integer raceId) {
        String metaKey = "race:" + raceId + ":meta";
        String positionKey = "race:" + raceId + ":positions";

        Object distanceObj = redisTemplate.opsForHash().get(metaKey, "distance");
        if (distanceObj == null) {
            // Chưa có trong Redis (chưa start hoặc đã kết thúc), lấy từ DB
            Race race = raceRepository.findById(raceId)
                    .orElseThrow(() -> new RuntimeException("Race not found"));
                    
            List<RaceEntry> entries = raceEntryRepository.findByRaceId(raceId);
            List<HorseTickState> initialHorses = new ArrayList<>();
            
            boolean isFinished = race.getStatus() == com.swp391.horseracing.module.race.entity.tournament.Race.RaceStatus.finished;
            List<com.swp391.horseracing.module.race.entity.result.RaceResult> results = null;
            if (isFinished) {
                results = raceResultRepository.findByEntry_Race_Id(raceId);
            }
            
            if (entries != null) {
                for (RaceEntry entry : entries) {
                    if (entry.getStatus() == RaceEntry.EntryStatus.approved) {
                        int rank = 0;
                        double progress = 0.0;
                        boolean finished = false;
                        
                        if (isFinished && results != null) {
                            progress = race.getDistance() != null ? race.getDistance().doubleValue() : 1000.0;
                            finished = true;
                            for (com.swp391.horseracing.module.race.entity.result.RaceResult r : results) {
                                if (r.getEntry().getId().equals(entry.getId())) {
                                    rank = r.getPosition();
                                    break;
                                }
                            }
                        }
                        
                        initialHorses.add(HorseTickState.builder()
                                .horseId(entry.getHorse().getId().longValue())
                                .progress(progress)
                                .speed(0.0)
                                .stamina(100.0)
                                .rank(rank)
                                .effect("NORMAL")
                                .finished(finished)
                                .build());
                    }
                }
            }
            
            if (isFinished) {
                initialHorses.sort(java.util.Comparator.comparingInt(HorseTickState::getRank));
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

        Set<ZSetOperations.TypedTuple<String>> ranking;
        if ("FINISHED".equals(status)) {
            String finishOrderKey = "race:" + raceId + ":finishOrder";
            ranking = redisTemplate.opsForZSet().rangeWithScores(finishOrderKey, 0, -1);
        } else {
            ranking = redisTemplate.opsForZSet().reverseRangeWithScores(positionKey, 0, -1);
        }

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

        // Prevent duplicate flags
        Object isFlaggedObj = redisTemplate.opsForHash().get(horseKey, "isFlagged");
        if (isFlaggedObj != null && "true".equals(String.valueOf(isFlaggedObj))) {
            throw new RuntimeException("Horse has already been flagged");
        }

        // Set isFlagged for realtime visual effect
        redisTemplate.opsForHash().put(horseKey, "isFlagged", "true");

        // Save flag event
        String flagsKey = "race:" + raceId + ":flags";
        String flagJson = String.format("{\"referee\":\"%s\", \"horseId\":%d, \"timestamp\":%d}", 
                                        refereeUsername, horseId, System.currentTimeMillis());
        redisTemplate.opsForList().rightPush(flagsKey, flagJson);
        redisTemplate.expire(flagsKey, 2, TimeUnit.HOURS);
    }

    @Override
    public List<RaceIncidentResponse> getRaceIncidents(Integer raceId) {
        List<RaceIncident> incidents = raceIncidentRepository.findByEntry_Race_Id(raceId);
        return incidents.stream().map(incident -> RaceIncidentResponse.builder()
                .id(incident.getId())
                .horseId(incident.getEntry().getHorse().getId())
                .horseName(incident.getEntry().getHorse().getName())
                .laneNumber(incident.getEntry().getLaneNumber())
                .refereeUsername(incident.getRefereeUsername())
                .timestamp(incident.getTimestamp())
                .createdAt(incident.getCreatedAt())
                .build()).toList();
    }
}
