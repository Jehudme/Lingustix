package com.nexus.lingustix.services;

import com.nexus.lingustix.repositories.RevokedTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

class CleanupServiceTest {

    private RevokedTokenRepository revokedTokenRepository;
    private CleanupService cleanupService;

    @BeforeEach
    void setup() {
        revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        cleanupService = new CleanupService(revokedTokenRepository);
    }

    @Test
    void cleanupExpiredTokens_deletesExpiredTokens() {
        LocalDateTime beforeCleanup = LocalDateTime.now();

        cleanupService.cleanupExpiredTokens();

        ArgumentCaptor<LocalDateTime> captor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(revokedTokenRepository).deleteByExpiryDateBefore(captor.capture());
        
        LocalDateTime capturedTime = captor.getValue();
        assertThat(capturedTime).isAfterOrEqualTo(beforeCleanup);
        assertThat(capturedTime).isBeforeOrEqualTo(LocalDateTime.now());
    }
}
