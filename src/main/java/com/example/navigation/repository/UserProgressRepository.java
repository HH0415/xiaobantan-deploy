package com.example.navigation.repository;

import com.example.navigation.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; 
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Integer> {
    Optional<UserProgress> findByUserIdAndTaskId(Integer userId, Integer taskId);
    
    List<UserProgress> findByUserId(Integer userId); 
}