package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Data 
@Entity
@Table(name = "Users") 
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    @Column(name = "user_id")
    private Integer userId;

    @Column(nullable = false, length = 20)
    private String role;

    @Nationalized // 👈 確保使用者中文姓名不變問號
    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Nationalized // 👈 確保偏好設定 JSON 支援中文
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String preferences;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private String password;

    @Nationalized // 👈 確保使用者地址支援中文
    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;
    
    private String verificationToken;

    @Column(length = 20)
    private String status = "APPROVED";
}