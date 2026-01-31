package com.nexus.lingustix.services;

import java.time.LocalDateTime;

public interface AuthService {
    TokenWithExpiry generateToken(String identifier, String password);
    TokenWithExpiry refreshToken(String token);
    void revokeToken(String token);
    boolean validateToken(String token);

    record TokenWithExpiry(String token, LocalDateTime expirationDate) {}
}
