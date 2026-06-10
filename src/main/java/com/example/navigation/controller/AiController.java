package com.example.navigation.controller;

import com.example.navigation.model.Attraction;
import com.example.navigation.repository.AttractionRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final ChatClient chatClient;
    private final AttractionRepository attractionRepository;

    // 透過建構子注入 ChatClient 與 Repository
    @Autowired
    public AiController(ChatClient.Builder chatClientBuilder, AttractionRepository attractionRepository) {
        this.chatClient = chatClientBuilder.build();
        this.attractionRepository = attractionRepository;
    }

    // 接收前端傳來的 JSON: {"prompt": "我想帶老人喝茶..."}
    public static class AiRequest {
        public String prompt;
    }

    @PostMapping("/recommend-itinerary")
    public List<Integer> recommendItinerary(@RequestBody AiRequest request) {
        
        // 1. 從資料庫撈出所有可用的景點與商家
        List<Attraction> allSpots = attractionRepository.findAll();
        
        // 2. 將景點轉換成 AI 看得懂的簡化文字清單 (ID: 名稱 - 描述)
        String spotsContext = allSpots.stream()
            .map(spot -> String.format("ID: %d, 名稱: %s, 描述: %s", 
                    spot.getAttractionId(), spot.getName(), spot.getDescription()))
            .collect(Collectors.joining("\n"));

        // 3. 設計 System Prompt (系統人設與嚴格指令)
        String systemPrompt = """
            你是一個專業的南投鹿谷小半天導遊。
            請根據使用者的需求，從以下景點清單中挑選出最適合的 3 個景點。
            
            【可選景點清單】：
            """ + spotsContext + """
            
            【嚴格規定】：
            你只能回傳一個包含 3 個整數 ID 的 JSON 陣列（例如：[1, 5, 12]）。
            絕對不要輸出任何其他文字、解釋或 Markdown 標籤（不要輸出 ```json）。
            """;

        // 4. 呼叫 Spring AI 產生回應
        String aiResponse = chatClient.prompt()
                .system(systemPrompt)
                .user("使用者的需求是：" + request.prompt)
                .call()
                .content();

        // 5. 將 AI 回傳的字串 "[1, 5, 12]" 轉回 List<Integer>
        try {
            // 清理可能出現的空白或括號
            String cleanResponse = aiResponse.replace("[", "").replace("]", "").trim();
            if (cleanResponse.isEmpty()) return List.of();
            
            return java.util.Arrays.stream(cleanResponse.split(","))
                    .map(String::trim)
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("AI 回傳格式解析失敗：" + aiResponse);
            // 若發生例外，給一組預設的空陣列或預設景點防呆
            return List.of(); 
        }
    }
}