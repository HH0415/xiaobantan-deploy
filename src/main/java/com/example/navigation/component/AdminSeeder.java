package com.example.navigation.component;

import com.example.navigation.model.User;
import com.example.navigation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 檢查資料庫是否已經有這個管理員信箱
        if (userRepository.findByEmail("admin@example.com").isEmpty()) {
            User admin = new User();
            admin.setRole("admin");
            admin.setUsername("系統總管理員");
            admin.setEmail("admin@example.com");
            // 🔒 這裡輸入你想預設的密碼，程式會自動加密存進 DB
            admin.setPassword(passwordEncoder.encode("admin123")); 
            admin.setStatus("APPROVED");
            
            userRepository.save(admin);
            System.out.println("==================================================");
            System.out.println("最高權限管理員 (admin@example.com) 已自動建立！");
            System.out.println("==================================================");
        }
    }
}