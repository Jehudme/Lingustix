package com.nexus.lingustix.services;

import com.nexus.lingustix.repositories.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service responsible for cleaning up expired data from the database.
 * This includes removing revoked JWT tokens that have naturally expired,
 * preventing indefinite table growth and improving query performance.
 */
@Service
@RequiredArgsConstructor
public class CleanupService {

    private final RevokedTokenRepository revokedTokenRepository;

    /**
     * Deletes all revoked tokens that have expired (expiryDate before current time).
     * Runs every hour (3600000 milliseconds) to maintain database performance.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        revokedTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
