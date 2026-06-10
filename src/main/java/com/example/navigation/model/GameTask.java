package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "game_tasks")
public class GameTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer taskId;

    // 關聯到哪個商家 (如果原本用 attractionId，建議也保留)
    private Integer merchantId; 
    private Integer attractionId;

    // 💡 確保 QR Code 掃描時可以對應到這家店 (通常可以直接用 merchantId 組合)
    @Column(unique = true, length = 50)
    private String qrSecret;

    // 💡 任務類型："puzzle" 或 "quiz"
    @Column(length = 20)
    private String taskType;

    // --- 若為問答任務，使用以下欄位 ---
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String question;
    
    // 將 A, B, C 選項存成 JSON 字串 (例如: {"A":"選項一", "B":"選項二", "C":"選項三"})
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String optionsJson;

    @Column(length = 100)
    private String answer;

    // --- 若為拼圖任務，使用以下欄位 ---
    @Column(columnDefinition = "VARCHAR(MAX)") // 拼圖的 Base64 字串會非常長
    private String puzzleImage;

    @Column(nullable = false)
    private Integer rewardPoints = 50; // 預設給 50 積分
}