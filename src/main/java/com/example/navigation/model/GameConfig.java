package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Data
@Entity
@Table(name = "game_configs")
public class GameConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String templateType;   // 模板類型：PUZZLE (拼圖) 或 QA (問答)
    
    @Nationalized // 👈 確保參數 JSON 內的中文題庫不變形
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String parameters;     // 參數設定 (建議存成 JSON 字串，例如圖片路徑或題庫)
}