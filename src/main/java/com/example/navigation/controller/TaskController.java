package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.dto.MerchantTaskRequest;
import com.example.navigation.dto.PuzzleRequest;
import com.example.navigation.model.GameTask;
import com.example.navigation.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping("/scan")
    public ApiResponse<GameTask> scanQrCode(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            String qrSecret = (String) request.get("qrSecret");
            GameTask taskInfo = taskService.scanQrCode(userId, qrSecret);
            return ApiResponse.success("成功解鎖任務", taskInfo);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/submit")
    public ApiResponse<String> submitAnswer(@RequestBody Map<String, Object> request) {
        try {
            Integer userId = (Integer) request.get("userId");
            Integer taskId = (Integer) request.get("taskId");
            String answer = (String) request.get("answer");
            
            boolean isCorrect = taskService.submitAnswer(userId, taskId, answer);
            if (isCorrect) {
                return ApiResponse.success("答對了！任務完成！", null);
            } else {
                return ApiResponse.error(400, "答案不對喔，再試試看！");
            }
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @GetMapping("/progress/{userId}")
    public ApiResponse<Map<String, Object>> getProgress(@PathVariable Integer userId) {
        try {
            Map<String, Object> overview = taskService.getUserProgressOverview(userId);
            return ApiResponse.success("進度查詢成功", overview);
        } catch (Exception e) {
            return ApiResponse.error(400, "查詢失敗：" + e.getMessage());
        }
    }

    @PostMapping("/puzzle")
    public ApiResponse<String> createPuzzleTask(@RequestBody PuzzleRequest request) {
        try {
            if (request.getPuzzleImage() == null || request.getPuzzleImage().isEmpty()) {
                return ApiResponse.error(400, "圖片不能為空");
            }
            return ApiResponse.success("拼圖任務發布成功", "OK");
        } catch (Exception e) {
            return ApiResponse.error(500, "發布失敗：" + e.getMessage());
        }
    }

    @PostMapping("/merchant-task")
    public ApiResponse<?> saveMerchantTask(@RequestBody MerchantTaskRequest request) {
        try {
            System.out.println("=========================================");
            System.out.println("收到商家 ID: " + request.getMerchantId() + " 的任務更新請求，類型：" + request.getTaskType());
            System.out.println("=========================================");
            
            taskService.saveMerchantTask(request);
            
            return ApiResponse.success("任務設定發布成功", "OK");
            
        } catch (Exception e) {
            e.printStackTrace();
            return ApiResponse.error(500, "伺服器儲存失敗：" + e.getMessage());
        }
    }
}