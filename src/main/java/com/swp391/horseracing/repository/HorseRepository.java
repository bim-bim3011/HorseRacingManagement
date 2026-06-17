package com.swp391.horseracing.repository;

import com.swp391.horseracing.entity.horse.Horse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorseRepository extends JpaRepository<Horse , Integer> {
    boolean existsByNameAndOwnerId(String name, Integer ownerId);//ownerId chủ ngựa phải tồn tại thì mới kiểm tra ngựa đó đã có trong ds chưa nếu có rồi thì thôi còn chưa thì lưu xuống
    // Lấy danh sách ngựa của chủ
    List<Horse> findByOwnerId(Integer ownerId);

    // Admin xem danh sách ngựa chờ duyệt
    List<Horse> findByStatus(Horse.HorseStatus status);
}
