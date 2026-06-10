package com.example.navigation.dto;

import lombok.Data;
import java.util.Map;

@Data
public class MerchantTaskRequest {
    private Integer merchantId;
    private String taskType; // "puzzle" 或 "quiz"
    
    // 如果是拼圖，會有這個欄位
    private String puzzleImage;
    
    // 如果是問答，會有這個欄位
    private QuizData quizData;

    @Data
    public static class QuizData {
        private String question;
        private Map<String, String> options; // 包含 A, B, C 的選項
        private String answer;
    }
}