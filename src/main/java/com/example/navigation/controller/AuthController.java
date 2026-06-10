package com.example.navigation.controller;

import com.example.navigation.dto.ApiResponse;
import com.example.navigation.dto.LoginRequest;
import com.example.navigation.dto.UserCreateRequest;
import com.example.navigation.dto.ForgotRequest;
import com.example.navigation.dto.ResetRequest;
import com.example.navigation.model.User;
import com.example.navigation.repository.UserRepository;
import com.example.navigation.security.JwtUtil;
import com.example.navigation.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") 
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ApiResponse<User> register(@RequestBody UserCreateRequest request) {
        try {
            User user = userService.createUser(request);
            user.setPassword(null); 
            return ApiResponse.success("註冊成功", user);
        } catch (Exception e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getUserId());
            user.setPassword(null);
            
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("token", token);
            responseData.put("user", user);

            return ApiResponse.success("登入成功", responseData);
            
        } catch (Exception e) {
            return ApiResponse.error(401, e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgotPassword(@RequestBody ForgotRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error(400, "查無此 Email，請確認輸入是否正確。");
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setVerificationToken(resetToken);
        userRepository.save(user);

        String resetLink = "http://127.0.0.1:5500/reset.html?token=" + resetToken;
        String emailBody = String.format("親愛的 %s 您好：\n\n我們收到了您的密碼重設請求。請點擊以下連結重設您的密碼：\n\n%s\n\n如果您並未提出此請求，請忽略這封信件。", user.getUsername(), resetLink);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("yhong0415@gmail.com"); 
            message.setTo(user.getEmail());
            message.setSubject("【小半天】密碼重設請求");
            message.setText(emailBody);
            
            mailSender.send(message);
            
            return ApiResponse.success("郵件已發送，請檢查信箱", null);
        } catch (Exception e) {
            return ApiResponse.error(500, "發信系統暫時故障，請稍後再試");
        }
    }

    @PostMapping("/reset-password")
    public ApiResponse<?> resetPassword(@RequestBody ResetRequest request) {
        Optional<User> userOpt = userRepository.findByVerificationToken(request.getToken());
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error(400, "無效或已過期的重設連結");
        }

        User user = userOpt.get();
        
        // 確保新密碼寫入資料庫前，已經過 BCrypt 加密處理
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        
        user.setVerificationToken(null);
        userRepository.save(user);

        return ApiResponse.success("密碼重設成功", null);
    }
}