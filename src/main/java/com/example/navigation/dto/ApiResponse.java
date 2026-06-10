package com.example.navigation.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private int status;       
    private String message;   
    private T data;           

    public static <T> ApiResponse<T> success(String message, T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus(200);
        response.setMessage(message);
        response.setData(data);
        return response;
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setStatus(status);
        response.setMessage(message);
        response.setData(null);
        return response;
    }
}