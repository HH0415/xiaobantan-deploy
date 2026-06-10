package com.example.navigation.dto;
import lombok.Data;

@Data
public class ResetRequest {
    private String token;
    private String newPassword;
}