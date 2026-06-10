package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.model.Attraction;
import com.example.navigation.repository.AttractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*")
public class MapController {

    @Autowired
    private AttractionRepository attractionRepository;

    // 取得所有地圖據點 (包含官方景點與已上架的商家)
    @GetMapping("/locations")
    public ApiResponse<List<Attraction>> getAllLocations() {
        try {
            List<Attraction> locations = attractionRepository.findAll();
            return ApiResponse.success("成功取得地圖據點", locations);
        } catch (Exception e) {
            return ApiResponse.error(500, "取得據點失敗：" + e.getMessage());
        }
    }
}