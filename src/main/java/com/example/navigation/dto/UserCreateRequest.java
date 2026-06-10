package com.example.navigation.dto;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String role;     
    private String username;  
    private String email;    
    private String password;
    private String address;

    private Double latitude;
    private Double longitude;
}