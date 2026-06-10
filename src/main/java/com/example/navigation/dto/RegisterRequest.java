package com.example.navigation.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String role; 
    private String address; 
    private Double latitude;
    private Double longitude;
}