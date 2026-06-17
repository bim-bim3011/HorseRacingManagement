package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.tournament.RaceEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceEntryRepository extends JpaRepository<RaceEntry , Integer> {
    // Kiểm tra ngựa đã đăng ký vào race chưa
    boolean existsByRaceIdAndHorseId(Integer raceId, Integer horseId);

    // Lấy danh sách entry của race
    List<RaceEntry> findByRaceId(Integer raceId);
    //findByRaceId:
    //Lấy danh sách ngựa đăng ký vào 1 vòng đấu
    //Dùng khi: admin/khán giả xem ngựa tham gia race



    // Lấy danh sách entry của ngựa
    List<RaceEntry> findByHorseId(Integer horseId);
    //findByHorseId:
    //Lấy lịch sử đua của 1 con ngựa
    //Dùng khi: xem ngựa đã tham gia những race nào




    // Admin xem danh sách entry chờ duyệt
    List<RaceEntry> findByStatus(RaceEntry.EntryStatus status);
    //findByStatus:
    //Lấy danh sách entry theo trạng thái
    //Dùng khi: admin xem entry chờ duyệt (pending_admin)




    // Đếm số entry đã approved trong race
    int countByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);
    //countByRaceIdAndStatus:
    //Đếm số ngựa đã được duyệt trong race
    //Dùng khi: kiểm tra race đã đủ ngựa chưa (max_entries)

    //xem danh sách ngựa đua ở race nào vào trạng thái đã đc duyệt chưa
    List<RaceEntry> findByRaceIdAndStatus(Integer raceId, RaceEntry.EntryStatus status);
}
