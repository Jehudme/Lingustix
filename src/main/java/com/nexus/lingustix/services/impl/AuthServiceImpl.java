package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.BadRequestException;
import com.nexus.lingustix.components.JwtComponent;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.RevokedToken;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.RevokedTokenRepository;
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
    private final AccountRepository accountRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public TokenWithExpiry generateToken(String identifier, String password) {
        Account account = accountRepository.findByEmail(identifier)
                .or(() -> accountRepository.findByUsername(identifier))
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(password, account.getHashedPassword())) {
            throw new BadRequestException("Invalid credentials");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", account.getUsername());
        claims.put("email", account.getEmail());

        String token = jwtComponent.createToken(claims, account.getId().toString(), expirationMs);
        return new TokenWithExpiry(token, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
    }

    @Override
    public TokenWithExpiry refreshToken(String token) {
        if (!jwtComponent.isTokenValid(token)) {
            throw new BadRequestException("Invalid token");
        }
        if (revokedTokenRepository.existsByToken(token)) {
            throw new BadRequestException("Invalid token");
        }
        String userId = jwtComponent.extractSubject(token);
        Account account = accountRepository.findById(java.util.UUID.fromString(userId))
                .orElseThrow(() -> new BadRequestException("Invalid token"));

        Map<String, Object> claims = new HashMap<>();
        claims.put("username", account.getUsername());
        claims.put("email", account.getEmail());

        String newToken = jwtComponent.createToken(claims, account.getId().toString(), expirationMs);
        return new TokenWithExpiry(newToken, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS));
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        if (!jwtComponent.isTokenValid(token)) {
            throw new BadRequestException("Invalid token");
        }
        revokedTokenRepository.save(new RevokedToken(token, LocalDateTime.now().plus(expirationMs, ChronoUnit.MILLIS)));
    }

    @Override
    public boolean validateToken(String token) {
        return jwtComponent.isTokenValid(token) && !revokedTokenRepository.existsByToken(token);
    }
}
