package com.nexus.lingustix.services;

import com.nexus.lingustix.repositories.RevokedTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CleanupService {

    private final RevokedTokenRepository revokedTokenRepository;

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        revokedTokenRepository.deleteByExpiryDateBefore(LocalDateTime.now());
    }
}
