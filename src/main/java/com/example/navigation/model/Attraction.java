package com.example.navigation.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Data
@Entity
@Table(name = "Attractions")
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attraction_id")
    private Integer attractionId;

    @Nationalized // 👈 確保景點名稱支援中文
    @Column(nullable = false, length = 100)
    private String name;

    @Nationalized // 👈 確保大文字描述支援中文
    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Nationalized // 👈 確保地址支援中文
    @Column(length = 255)
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    // 如果是官方景點，這欄會是 null；如果是商家，就會記錄商家的 userId
    @Column(name = "merchant_id")
    private Integer merchantId;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String imageUrl;
}