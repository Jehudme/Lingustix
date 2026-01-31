package com.nexus.lingustix.controllers;

import com.nexus.lingustix.components.JwtAuthComponent;
import com.nexus.lingustix.models.requests.LoginRequest;
import com.nexus.lingustix.models.responses.LoginResponse;
import com.nexus.lingustix.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtAuthComponent jwtAuthComponent;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var tokenWithExpiry = authService.generateToken(request.identifier(), request.password());
        return ResponseEntity.ok(new LoginResponse(tokenWithExpiry.token(), tokenWithExpiry.expirationDate()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        String token = jwtAuthComponent.extractTokenFromHeader(authHeader)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Authorization header"));

        authService.revokeToken(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestHeader("Authorization") String authHeader) {
        String token = jwtAuthComponent.extractTokenFromHeader(authHeader)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Authorization header"));

        var tokenWithExpiry = authService.refreshToken(token);
        return ResponseEntity.ok(new LoginResponse(tokenWithExpiry.token(), tokenWithExpiry.expirationDate()));
    }
}
