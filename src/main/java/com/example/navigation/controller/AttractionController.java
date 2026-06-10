package com.example.navigation.controller;

import com.example.navigation.model.Attraction;
import com.example.navigation.model.GameConfig;
import com.example.navigation.service.AttractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attractions")
public class AttractionController {

    @Autowired
    private AttractionService service;

    // 景點 CRUD API：取得所有景點
    @GetMapping
    public List<Attraction> getAll() {
        return service.getAllAttractions();
    }

    // 景點 CRUD API：新增景點
    @PostMapping
    public Attraction createAttraction(@RequestBody Attraction attraction) {
        return service.saveAttraction(attraction);
    }

    // 管理景點經緯度 API
    @PatchMapping("/{id}/coordinates")
    public ResponseEntity<Attraction> updateCoordinates(
            @PathVariable Integer id,
            @RequestParam Double lat,
            @RequestParam Double lng) {
        return ResponseEntity.ok(service.updateCoordinates(id, lat, lng));
    }

    // 景點 CRUD API：刪除景點
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttraction(@PathVariable Integer id) {
        service.deleteAttraction(id);
        return ResponseEntity.ok().build();
    }
}