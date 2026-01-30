package com.nexus.lingustix.services;


public interface AuthService {
    String generateToken(String username, String password);
    String refreshToken(String token);
    void revokeToken(String token);
    boolean validateToken(String token);
}