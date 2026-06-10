package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.dto.UserCreateRequest;
import com.example.navigation.model.User;
import com.example.navigation.repository.UserRepository;
import com.example.navigation.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users") 
@CrossOrigin(origins = "*") 
public class UserController {

    @Autowired
    private UserService userService; 

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ApiResponse<User> registerUser(@RequestBody UserCreateRequest request) {
        try {
            User savedUser = userService.createUser(request);
            savedUser.setPassword(null); 
            return ApiResponse.success("用戶註冊成功", savedUser); 
        } catch (Exception e) {
            return ApiResponse.error(500, "註冊失敗：" + e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ApiResponse<User> getUser(@PathVariable Integer userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(null); 
            return ApiResponse.success("取得資料成功", user);
        } else {
            return ApiResponse.error(404, "找不到使用者");
        }
    }

    @PutMapping("/{userId}")
    public ApiResponse<User> updateUser(@PathVariable Integer userId, @RequestBody User request) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            
            user.setUsername(request.getUsername());
            user.setAddress(request.getAddress());
            user.setPhone(request.getPhone());

            userRepository.save(user);
            
            user.setPassword(null); 
            return ApiResponse.success("更新成功", user);
        } else {
            return ApiResponse.error(404, "找不到使用者");
        }
    }
}