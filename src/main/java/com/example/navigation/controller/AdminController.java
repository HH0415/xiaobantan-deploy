package com.example.navigation.controller;

import com.example.navigation.dto.AttractionRequest;
import com.example.navigation.dto.DashboardResponse;
import com.example.navigation.dto.UserStatusRequest;
import com.example.navigation.model.Attraction;
import com.example.navigation.model.User;
import com.example.navigation.repository.AttractionRepository;
import com.example.navigation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AttractionRepository attractionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        DashboardResponse dto = new DashboardResponse();
        dto.setTotalUsers(userRepository.count());
        dto.setTotalMerchants(userRepository.findAll().stream().filter(u -> "merchant".equals(u.getRole())).count());
        dto.setTotalSpots(attractionRepository.count());
        dto.setTotalTasks(152);

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("data", dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/attractions")
    public ResponseEntity<Map<String, Object>> createAttraction(@RequestBody AttractionRequest req) {
        Attraction spot = new Attraction();
        spot.setName(req.getName());
        spot.setAddress(req.getAddress());
        spot.setLatitude(req.getLatitude());
        spot.setLongitude(req.getLongitude());
        spot.setDescription(req.getDescription());
        spot.setMerchantId(null);

        attractionRepository.save(spot);

        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/attractions/{id}")
    public ResponseEntity<Map<String, Object>> updateAttraction(@PathVariable Integer id, @RequestBody AttractionRequest req) {
        Optional<Attraction> optSpot = attractionRepository.findById(id);
        if (optSpot.isPresent()) {
            Attraction spot = optSpot.get();
            spot.setName(req.getName());
            spot.setAddress(req.getAddress());
            spot.setLatitude(req.getLatitude());
            spot.setLongitude(req.getLongitude());
            spot.setDescription(req.getDescription());
            attractionRepository.save(spot);
        }
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/attractions/{id}")
    public ResponseEntity<Map<String, Object>> deleteAttraction(@PathVariable Integer id) {
        attractionRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<User> users = userRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("data", users);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/review")
    public ResponseEntity<Map<String, Object>> reviewUser(@PathVariable Integer id, @RequestBody UserStatusRequest req) {
        Optional<User> optUser = userRepository.findById(id);
        Map<String, Object> response = new HashMap<>();
        
        if (optUser.isPresent()) {
            User user = optUser.get();
            if ("approve".equals(req.getAction())) {
                user.setStatus("ACTIVE");
            } else if ("reject".equals(req.getAction())) {
                user.setStatus("REJECTED");
            }
            userRepository.save(user);
            response.put("status", 200);
            response.put("message", "審核成功");
        } else {
            response.put("status", 404);
            response.put("message", "找不到該使用者");
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(@PathVariable Integer id, @RequestBody UserStatusRequest req) {
        Optional<User> optUser = userRepository.findById(id);
        Map<String, Object> response = new HashMap<>();
        
        if (optUser.isPresent()) {
            User user = optUser.get();
            if (req.getStatus() != null) {
                user.setStatus(req.getStatus().toUpperCase());
            }
            userRepository.save(user);
            response.put("status", 200);
            response.put("message", "狀態更新成功");
        } else {
            response.put("status", 404);
            response.put("message", "找不到該使用者");
        }
        return ResponseEntity.ok(response);
    }
}