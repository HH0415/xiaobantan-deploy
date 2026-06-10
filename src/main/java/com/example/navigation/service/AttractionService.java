package com.example.navigation.service;

import com.example.navigation.model.Attraction;
import com.example.navigation.model.GameConfig;
import com.example.navigation.repository.AttractionRepository;
import org.springframework.lang.NonNull;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttractionService {

    @Autowired
    private AttractionRepository repository;

    // 取得所有景點
    public List<Attraction> getAllAttractions() {
        return repository.findAll();
    }

    // 新增或更新景點 (包含經緯度)
    public Attraction saveAttraction(@NonNull Attraction attraction) {
        Objects.requireNonNull(attraction, "attraction must not be null");
        return repository.save(attraction);
    }

    // 更新景點經緯度
    public Attraction updateCoordinates(@NonNull Integer id, Double lat, Double lng) {
        Objects.requireNonNull(id, "id must not be null");
        Attraction attraction = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("找不到該景點"));
        attraction.setLatitude(lat);
        attraction.setLongitude(lng);
        return repository.save(attraction);
    }
    
    // 刪除景點
    public void deleteAttraction(@NonNull Integer id) {
        Objects.requireNonNull(id, "id must not be null");
        repository.deleteById(id);
    }
}