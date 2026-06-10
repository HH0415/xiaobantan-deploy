package com.example.navigation.repository;

import com.example.navigation.model.GameTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GameTaskRepository extends JpaRepository<GameTask, Integer> {
    Optional<GameTask> findByQrSecret(String qrSecret);
    
    // 💡 讓後端可以尋找特定商家設定過的任務
    Optional<GameTask> findByMerchantId(Integer merchantId);
}