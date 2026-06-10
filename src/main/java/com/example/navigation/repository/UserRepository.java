package com.example.navigation.repository;

import com.example.navigation.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    
    Optional<User> findByVerificationToken(String token);

    List<User> findByRoleIgnoreCaseAndStatus(String role, String status);
}