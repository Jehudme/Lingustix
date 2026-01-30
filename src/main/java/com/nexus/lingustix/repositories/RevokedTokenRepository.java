package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, UUID> {
    boolean existsByToken(String jwt);
    void deleteByExpiryDateBefore(LocalDateTime dateTime);
}