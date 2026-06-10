package com.example.navigation.service;

import com.example.navigation.dto.MerchantTaskRequest;
import com.example.navigation.model.GameTask;
import com.example.navigation.model.UserProgress;
import com.example.navigation.repository.GameTaskRepository;
import com.example.navigation.repository.UserProgressRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private GameTaskRepository gameTaskRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ==========================================
    // 🎯 儲存或更新商家的解鎖任務
    // ==========================================
    public void saveMerchantTask(MerchantTaskRequest request) throws Exception {
        Integer merchantId = request.getMerchantId();
        
        // 找看看這家店是不是已經設過任務了？(有就覆蓋，沒有就新增)
        GameTask task = gameTaskRepository.findByMerchantId(merchantId).orElse(new GameTask());
        
        task.setMerchantId(merchantId);
        
        // 防呆：如果你的資料表 attractionId 設定為 nullable=false，可以先填 merchantId
        if (task.getAttractionId() == null) {
            task.setAttractionId(merchantId); 
        }

        task.setTaskType(request.getTaskType());
        // 設定專屬的 QR Secret (前端會產生 index34.html?merchantId=XXX)
        task.setQrSecret("shop_" + merchantId); 

        // 根據任務類型寫入不同的資料
        if ("puzzle".equals(request.getTaskType())) {
            task.setPuzzleImage(request.getPuzzleImage());
            
            // 🎯 防呆：塞入預設值滿足 DB 的 NOT NULL 條件，避免 500 錯誤！
            task.setQuestion("【拼圖任務】請完成圖片拼圖");
            task.setOptionsJson("{}");
            task.setAnswer("PUZZLE_DONE");

        } else if ("quiz".equals(request.getTaskType())) {
            MerchantTaskRequest.QuizData quizData = request.getQuizData();
            task.setQuestion(quizData.getQuestion());
            task.setAnswer(quizData.getAnswer());
            
            // 將選項 Map {"A":"...", "B":"..."} 轉成 JSON 字串存起來
            String optionsStr = objectMapper.writeValueAsString(quizData.getOptions());
            task.setOptionsJson(optionsStr);

            // 清空拼圖資料
            task.setPuzzleImage(null);
        } else {
            throw new Exception("未知的任務類型");
        }

        if (task.getRewardPoints() == null) {
            task.setRewardPoints(50); // 預設 50 分
        }

        // 存入資料庫
        gameTaskRepository.save(task);
    }

    // ==========================================
    // 遊客掃描 QR Code
    // ==========================================
    public GameTask scanQrCode(Integer userId, String qrSecret) throws Exception {
        GameTask task = gameTaskRepository.findByQrSecret(qrSecret)
                .orElseThrow(() -> new Exception("無效的 QR Code"));

        Optional<UserProgress> existingProgress = userProgressRepository.findByUserIdAndTaskId(userId, task.getTaskId());
        if (existingProgress.isEmpty()) {
            UserProgress progress = new UserProgress();
            progress.setUserId(userId);
            progress.setTaskId(task.getTaskId());
            progress.setStatus("UNLOCKED");
            userProgressRepository.save(progress);
        }
        
        // 只回傳前端需要的安全資訊 (不回傳整包 User 進去)
        GameTask safeTaskInfo = new GameTask();
        safeTaskInfo.setTaskId(task.getTaskId());
        safeTaskInfo.setTaskType(task.getTaskType());       // 💡 告訴前端是哪種遊戲
        safeTaskInfo.setQuestion(task.getQuestion());       // 💡 題目
        safeTaskInfo.setOptionsJson(task.getOptionsJson()); // 💡 選項
        safeTaskInfo.setPuzzleImage(task.getPuzzleImage()); // 💡 拼圖圖片
        safeTaskInfo.setRewardPoints(task.getRewardPoints());
        return safeTaskInfo;
    }

    // ==========================================
    // 遊客送出答案 (適用於問答與拼圖)
    // ==========================================
    public boolean submitAnswer(Integer userId, Integer taskId, String answer) throws Exception {
        GameTask task = gameTaskRepository.findById(taskId)
                .orElseThrow(() -> new Exception("找不到該任務"));

        UserProgress progress = userProgressRepository.findByUserIdAndTaskId(userId, taskId)
                .orElseThrow(() -> new Exception("請先掃描 QR Code 解鎖任務"));

        if ("COMPLETED".equals(progress.getStatus())) {
            throw new Exception("此任務已經完成過了！");
        }

        // 💡 如果是拼圖，前端送來的 answer 可能是 "PUZZLE_DONE"，就直接讓他過
        // 如果是問答，就比對答案是否正確
        if (task.getAnswer() == null || task.getAnswer().equals(answer.trim()) || "PUZZLE_DONE".equals(answer)) {
            progress.setStatus("COMPLETED");
            progress.setCompletedAt(LocalDateTime.now());
            userProgressRepository.save(progress);
            return true;
        }
        return false;
    }

    public Map<String, Object> getUserProgressOverview(Integer userId) {
        List<UserProgress> allProgress = userProgressRepository.findByUserId(userId);
        
        int totalPoints = 0;
        int completedCount = 0;

        for (UserProgress p : allProgress) {
            if ("COMPLETED".equals(p.getStatus())) {
                completedCount++;
                GameTask task = gameTaskRepository.findById(p.getTaskId()).orElse(null);
                if (task != null && task.getRewardPoints() != null) {
                    totalPoints += task.getRewardPoints();
                }
            }
        }

        return Map.of(
            "userId", userId,
            "completedTasks", completedCount,
            "totalPoints", totalPoints,
            "progressDetails", allProgress
        );
    }
}