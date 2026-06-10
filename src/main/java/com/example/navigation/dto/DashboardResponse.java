package com.example.navigation.dto;
import java.util.List;
import java.util.Map;

public class DashboardResponse {
    private long totalUsers;
    private long totalMerchants;
    private long totalSpots;
    private long totalTasks;
    private List<Map<String, String>> recentActivities;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getTotalMerchants() { return totalMerchants; }
    public void setTotalMerchants(long totalMerchants) { this.totalMerchants = totalMerchants; }
    public long getTotalSpots() { return totalSpots; }
    public void setTotalSpots(long totalSpots) { this.totalSpots = totalSpots; }
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public List<Map<String, String>> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<Map<String, String>> recentActivities) { this.recentActivities = recentActivities; }
}