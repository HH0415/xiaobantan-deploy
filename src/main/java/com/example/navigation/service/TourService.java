package com.example.navigation.service;

import com.example.navigation.model.Attraction;
import com.example.navigation.repository.AttractionRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TourService {

    @Autowired
    private AttractionRepository attractionRepository;
    
    @Autowired
    private RouteOptimizationService routeService;

    private final ChatClient chatClient;

    public TourService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public List<Attraction> generateSmartRoute(String userPreference) {
        List<Attraction> allAttractions = attractionRepository.findAll();
        
        String attractionListStr = allAttractions.stream()
            .map(a -> "ID:" + a.getAttractionId() + " 名稱:" + a.getName() + " 描述:" + a.getDescription())
            .collect(Collectors.joining("\n"));

        String prompt = String.format("""
            你是一個專業導遊。遊客的需求是：「%s」。
            請從以下景點列表中，挑選出最符合條件的 3 個景點。
            
            景點列表：
            %s
            
            請「只」回傳這 3 個景點的 ID，用逗號分隔，不要說其他廢話。
            """, userPreference, attractionListStr);

        String aiResponse = chatClient.prompt().user(prompt).call().content();
        
        List<Integer> selectedIds = Arrays.stream(aiResponse.split(","))
                                          .map(String::trim)
                                          .map(Integer::parseInt)
                                          .collect(Collectors.toList());

        List<Attraction> selectedAttractions = attractionRepository.findAllById(selectedIds);
        
        List<Map<String, Object>> locationData = selectedAttractions.stream()
            .map(a -> Map.of(
                "id", (Object) a.getAttractionId(), 
                "lat", a.getLatitude(), 
                "lng", a.getLongitude()
            ))
            .collect(Collectors.toList());

        List<Integer> optimizedIds = routeService.getOptimizedRoute(locationData);

        Map<Integer, Attraction> attractionMap = selectedAttractions.stream()
            .collect(Collectors.toMap(Attraction::getAttractionId, a -> a));

        return optimizedIds.stream()
            .map(attractionMap::get)
            .collect(Collectors.toList());
    }
}