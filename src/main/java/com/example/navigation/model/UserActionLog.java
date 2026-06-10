package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_action_logs")
public class UserActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer logId;
    
    private Integer userId;

    @Nationalized // 👈 支援中文行為類型 (例如: 每日簽到)
    @Column(length = 50)
    private String actionType;

    @Nationalized // 👈 支援中文日誌標題
    @Column(length = 100)
    private String actionTitle;

    @Nationalized // 👈 支援中文詳細敘述
    @Column(length = 255)
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