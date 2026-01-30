package com.nexus.lingustix.services;


public interface AuthService {
    TokenWithExpiry generateToken(String username, String password);
    TokenWithExpiry refreshToken(String token);
    void revokeToken(String token);
    boolean validateToken(String token);

    record TokenWithExpiry(String token, java.time.LocalDateTime expirationDate) {}
}
