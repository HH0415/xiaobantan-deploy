package com.example.navigation.service;

import com.example.navigation.model.UserActionLog;
import com.example.navigation.repository.UserActionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ActionLogService {

    @Autowired
    private UserActionLogRepository logRepository;

    // 隨時可以呼叫這個方法來記錄歷程
    public void logAction(Integer userId, String type, String title, String desc, Integer points) {
        UserActionLog log = new UserActionLog();
        log.setUserId(userId);
        log.setActionType(type);
        log.setActionTitle(title);
        log.setActionDesc(desc);
        log.setPointsEarned(points != null ? points : 0);
        
        logRepository.save(log);
    }
}