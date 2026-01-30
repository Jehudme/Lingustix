package com.nexus.lingustix.services;

import com.nexus.lingustix.components.JwtComponent;
import com.nexus.lingustix.components.GlobalExceptionComponent.BadRequestException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.RevokedTokenRepository;
import com.nexus.lingustix.services.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    private AccountRepository accountRepository;
    private RevokedTokenRepository revokedTokenRepository;
    private PasswordEncoder passwordEncoder;
    private JwtComponent jwtComponent;
    private AuthServiceImpl authService;

    @BeforeEach
    void setup() {
        accountRepository = Mockito.mock(AccountRepository.class);
        revokedTokenRepository = Mockito.mock(RevokedTokenRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        jwtComponent = Mockito.mock(JwtComponent.class);

        authService = new AuthServiceImpl(jwtComponent, accountRepository, revokedTokenRepository, passwordEncoder);
        authService.expirationMs = 1000L;
    }

    @Test
    void generateToken_returnsTokenWithExpiry() {
        Account account = Account.builder()
                .id(UUID.randomUUID())
                .username("user")
                .email("mail@test.com")
                .hashedPassword("hashed")
                .build();
        when(accountRepository.findByEmail("user")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("pass", "hashed")).thenReturn(true);
        when(jwtComponent.createToken(any(), any(), any())).thenReturn("jwt");

        var result = authService.generateToken("user", "pass");

        assertThat(result.token()).isEqualTo("jwt");
        assertThat(result.expirationDate()).isAfter(LocalDateTime.now());
    }

    @Test
    void refreshToken_rejectsRevoked() {
        when(jwtComponent.isTokenValid("bad")).thenReturn(true);
        when(revokedTokenRepository.existsByToken("bad")).thenReturn(true);

        assertThatThrownBy(() -> authService.refreshToken("bad"))
                .isInstanceOf(BadRequestException.class);
    }
}
