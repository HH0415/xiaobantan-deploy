package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.model.Attraction;
import com.example.navigation.service.TourService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tour")
public class TourController {

    @Autowired
    private TourService tourService;

    @PostMapping("/smart-route")
    public ApiResponse<List<Attraction>> getSmartRoute(@RequestBody Map<String, String> request) {
        try {
            String preference = request.get("preference");
            List<Attraction> route = tourService.generateSmartRoute(preference);
            return ApiResponse.success("智慧路徑規劃成功", route);
        } catch (Exception e) {
            return ApiResponse.error(500, "規劃失敗：" + e.getMessage());
        }
    }
}