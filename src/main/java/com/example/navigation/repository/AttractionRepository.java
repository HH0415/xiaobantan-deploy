package com.example.navigation.repository;

import com.example.navigation.model.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttractionRepository extends JpaRepository<Attraction, Integer> {
    
    Optional<Attraction> findByMerchantId(Integer merchantId);

}