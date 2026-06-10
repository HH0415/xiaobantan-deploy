package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "Attractions")
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attraction_id")
    private Integer attractionId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    // 如果是官方景點，這欄會是 null；如果是商家，就會記錄商家的 userId
    @Column(name = "merchant_id")
    private Integer merchantId;
}