package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
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

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String preferences;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private String password;
    private String address;
    private String phone;
    
    private String verificationToken;

    @Column(length = 20)
    private String status = "APPROVED";
}