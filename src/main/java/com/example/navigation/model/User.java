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

    @Nationalized
    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String email;

    @Nationalized
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String preferences;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
    
    private String password;

    @Nationalized
    @Column(length = 255)
    private String address;

    @Column(length = 50)
    private String phone;
    
    private String verificationToken;

    @Column(length = 20)
    private String status = "APPROVED";
}