package com.example.navigation.repository;

import com.example.navigation.model.UserActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserActionLogRepository extends JpaRepository<UserActionLog, Integer> {
    // 💡 依照使用者 ID 尋找，並用時間「由新到舊 (Desc)」排序
    List<UserActionLog> findByUserIdOrderByCreatedAtDesc(Integer userId);
}