package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.model.Attraction;
import com.example.navigation.repository.AttractionRepository;
import com.example.navigation.service.AttractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/attractions")
public class AttractionController {

    @Autowired
    private AttractionService service;

    @Autowired
    private AttractionRepository attractionRepository;

    @GetMapping
    public List<Attraction> getAll() {
        return service.getAllAttractions();
    }

    @PostMapping
    public Attraction createAttraction(@RequestBody Attraction attraction) {
        return service.saveAttraction(attraction);
    }

    @PatchMapping("/{id}/coordinates")
    public ResponseEntity<Attraction> updateCoordinates(
            @PathVariable Integer id,
            @RequestParam Double lat,
            @RequestParam Double lng) {
        return ResponseEntity.ok(service.updateCoordinates(id, lat, lng));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttraction(@PathVariable Integer id) {
        service.deleteAttraction(id);
        return ResponseEntity.ok().build();
    }

    // 💡 升級版：修改商家景點資料 (包含舊帳號自動補辦地標功能)
    @PutMapping("/merchant/{merchantId}")
    public ApiResponse<?> updateMerchantAttraction(
            @PathVariable Integer merchantId,
            @RequestBody Attraction updateRequest) {
        
        Optional<Attraction> existingAttraction = attractionRepository.findByMerchantId(merchantId);
        Attraction attraction;
        
        if (existingAttraction.isPresent()) {
            // 如果原本就有地標，直接拿出來改
            attraction = existingAttraction.get();
        } else {
            // 💡 【超強防呆】如果是舊帳號，資料庫還沒有他的地標，就在這裡當場幫他補建一個！
            attraction = new Attraction();
            attraction.setMerchantId(merchantId);
        }
        
        // 更新前端傳來的新資料
        attraction.setName(updateRequest.getName());
        attraction.setAddress(updateRequest.getAddress());
        attraction.setDescription(updateRequest.getDescription());
        
        // 更新手動輸入的經緯度
        if (updateRequest.getLatitude() != null && updateRequest.getLatitude() != 0.0) {
            attraction.setLatitude(updateRequest.getLatitude());
            attraction.setLongitude(updateRequest.getLongitude());
        } else if (attraction.getLatitude() == null) {
            // 如果都沒填，給一個小半天的預設中心點座標
            attraction.setLatitude(23.726925);
            attraction.setLongitude(120.758167);
        }
        
        // 存回資料庫
        attractionRepository.save(attraction);
        return ApiResponse.success("更新成功", attraction);
    }
}