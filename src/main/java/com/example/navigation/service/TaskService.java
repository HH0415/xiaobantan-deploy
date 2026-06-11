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

    public void saveMerchantTask(MerchantTaskRequest request) throws Exception {
        Integer merchantId = request.getMerchantId();
        
        GameTask task = gameTaskRepository.findByMerchantId(merchantId).orElse(new GameTask());
        
        task.setMerchantId(merchantId);
        
        if (task.getAttractionId() == null) {
            task.setAttractionId(merchantId); 
        }

        task.setTaskType(request.getTaskType());
        task.setQrSecret("shop_" + merchantId); 

        if ("puzzle".equals(request.getTaskType())) {
            task.setPuzzleImage(request.getPuzzleImage());
            task.setQuestion("【拼圖任務】請完成圖片拼圖");
            task.setOptionsJson("{}");
            task.setAnswer("PUZZLE_DONE");
        } else if ("quiz".equals(request.getTaskType())) {
            MerchantTaskRequest.QuizData quizData = request.getQuizData();
            task.setQuestion(quizData.getQuestion());
            task.setAnswer(quizData.getAnswer());
            
            String optionsStr = objectMapper.writeValueAsString(quizData.getOptions());
            task.setOptionsJson(optionsStr);

            task.setPuzzleImage(null);
        } else {
            throw new Exception("未知的任務類型");
        }

        if (task.getRewardPoints() == null) {
            task.setRewardPoints(50);
        }

        gameTaskRepository.save(task);
    }

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
        
        GameTask safeTaskInfo = new GameTask();
        safeTaskInfo.setTaskId(task.getTaskId());
        safeTaskInfo.setTaskType(task.getTaskType()); 
        safeTaskInfo.setQuestion(task.getQuestion()); 
        safeTaskInfo.setOptionsJson(task.getOptionsJson()); 
        safeTaskInfo.setPuzzleImage(task.getPuzzleImage()); 
        safeTaskInfo.setRewardPoints(task.getRewardPoints());
        return safeTaskInfo;
    }

    public boolean submitAnswer(Integer userId, Integer taskId, String answer) throws Exception {
        GameTask task = gameTaskRepository.findById(taskId)
                .orElseThrow(() -> new Exception("找不到該任務"));

        UserProgress progress = userProgressRepository.findByUserIdAndTaskId(userId, taskId)
                .orElseThrow(() -> new Exception("請先掃描 QR Code 解鎖任務"));

        if ("COMPLETED".equals(progress.getStatus())) {
            throw new Exception("此任務已經完成過了！");
        }

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