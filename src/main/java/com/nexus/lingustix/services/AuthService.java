package com.nexus.lingustix.services;


public interface AuthService {
    String login(String username, String password);
    void logout(String token);

    boolean validateToken(String token);
    String refreshToken(String token);
}