package com.example.navigation.service;

import com.example.navigation.dto.LoginRequest; 
import com.example.navigation.dto.UserCreateRequest;
import com.example.navigation.model.User;
import com.example.navigation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service 
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 💡 注入我們剛剛建立的密碼加密器
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(UserCreateRequest request) throws Exception {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("此信箱已經註冊過了！");
        }

        if ("MERCHANT".equals(request.getRole())) {
            if (request.getAddress() == null || request.getAddress().trim().isEmpty()) {
                throw new Exception("註冊為商家，必須填寫實體地址！");
            }
        }

        User newUser = new User();
        newUser.setRole(request.getRole());
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        
        // 🔒 將前端傳來的明碼密碼，加密後再存入資料庫
        newUser.setPassword(passwordEncoder.encode(request.getPassword())); 
        
        if ("MERCHANT".equals(request.getRole())) {
            newUser.setAddress(request.getAddress());
            newUser.setStatus("PENDING"); 
        } else {
            newUser.setStatus("APPROVED"); 
        }

        return userRepository.save(newUser);
    }

    public User loginUser(LoginRequest request) throws Exception {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new Exception("找不到此信箱，請先註冊！"));
                
        // 🔒 使用 passwordEncoder 專屬的比對方法 (明碼, 資料庫裡的亂碼)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("密碼錯誤！");
        }

        if ("MERCHANT".equalsIgnoreCase(user.getRole()) && "PENDING".equals(user.getStatus())) {
            throw new Exception("您的商家帳號正在審核中，請耐心等候總管理員開通權限！");
        }

        return user;
    }
}