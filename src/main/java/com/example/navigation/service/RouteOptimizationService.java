package com.example.navigation.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Service
public class RouteOptimizationService {

    private final RestClient restClient;

    public RouteOptimizationService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    public List<Integer> getOptimizedRoute(List<Map<String, Object>> locations) {
        Map response = restClient.post()
                .uri("/api/optimize-route")
                .body(Map.of("locations", locations))
                .retrieve()
                .body(Map.class);

        return (List<Integer>) response.get("optimized_order");
    }
}