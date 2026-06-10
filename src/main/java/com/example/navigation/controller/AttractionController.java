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

    @PutMapping("/merchant/{merchantId}")
    public ApiResponse<?> updateMerchantAttraction(
            @PathVariable Integer merchantId,
            @RequestBody Attraction updateRequest) {
        Optional<Attraction> existingAttraction = attractionRepository.findByMerchantId(merchantId);
        if (existingAttraction.isPresent()) {
            Attraction attraction = existingAttraction.get();
            attraction.setName(updateRequest.getName());
            attraction.setAddress(updateRequest.getAddress());
            attraction.setDescription(updateRequest.getDescription());
            
            if (updateRequest.getLatitude() != null && updateRequest.getLatitude() != 0.0) {
                attraction.setLatitude(updateRequest.getLatitude());
                attraction.setLongitude(updateRequest.getLongitude());
            }
            
            attractionRepository.save(attraction);
            return ApiResponse.success("更新成功", attraction);
        } else {
            return ApiResponse.error(404, "找不到該商家的景點資料");
        }
    }
}