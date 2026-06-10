package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "UserProgress")
public class UserProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer progressId;

    @Column(nullable = false)
    private Integer userId;

    @Column(nullable = false)
    private Integer taskId;

    @Column(nullable = false, length = 20)
    private String status; // 通常為英文字串代碼 (如: COMPLETED)

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}