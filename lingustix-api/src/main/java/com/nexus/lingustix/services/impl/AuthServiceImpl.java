package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.BadRequestException;
import com.nexus.lingustix.components.JwtComponent;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.RevokedToken;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.RevokedTokenRepository;
import com.nexus.lingustix.services.AccountService;
import com.nexus.lingustix.services.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Value("${app.jwt.expiration-ms}")
    @Setter
    private long expirationMs;

    private final JwtComponent jwtComponent;
    private final AccountService accountService;
    private final RevokedTokenRepository revokedTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public TokenWithExpiry generateToken(String identifier, String password) {
        Account account = accountService.getByIdentifier(identifier)
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(password, account.getHashedPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        String token = jwtComponent.createToken(new HashMap<>(), account.getId().toString(), expirationMs);
        return new TokenWithExpiry(token, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
    }

    @Override
    @Transactional
    public TokenWithExpiry refreshToken(String token) {
        if (!validateToken(token)) throw new BadRequestException("Invalid token");
        revokeToken(token);

        String accountId = jwtComponent.extractSubject(token);
        String newToken = jwtComponent.createToken(new HashMap<>(), accountId, expirationMs);
        return new TokenWithExpiry(newToken, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        if (!jwtComponent.isTokenValid(token)) throw new BadRequestException("Invalid token");
        revokedTokenRepository.save(new RevokedToken(token, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS)));
    }

    @Override
    public boolean validateToken(String token) {
        return jwtComponent.isTokenValid(token) && !revokedTokenRepository.existsByToken(token);
    }
}
