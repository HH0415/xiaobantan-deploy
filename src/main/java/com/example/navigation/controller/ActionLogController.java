package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.model.UserActionLog;
import com.example.navigation.repository.UserActionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class ActionLogController {

    @Autowired
    private UserActionLogRepository logRepository;

    @GetMapping("/{userId}")
    public ApiResponse<List<UserActionLog>> getUserLogs(@PathVariable Integer userId) {
        try {
            List<UserActionLog> logs = logRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return ApiResponse.success("成功取得互動歷程", logs);
        } catch (Exception e) {
            return ApiResponse.error(500, "取得歷程失敗：" + e.getMessage());
        }
    }
}