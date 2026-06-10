package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_action_logs")
public class UserActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer logId;
    
    private Integer userId;
    private String actionType;
    private String actionTitle;
    private String actionDesc;
    private Integer pointsEarned;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // 💡 在寫入資料庫前，自動填入當前時間
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}