package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.requests.LoginRequest;
import com.nexus.lingustix.models.requests.RefreshTokenRequest;
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

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        var tokenWithExpiry = authService.generateToken(request.identifier(), request.password());
        return ResponseEntity.ok(new LoginResponse(tokenWithExpiry.token(), tokenWithExpiry.expirationDate()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        var tokenWithExpiry = authService.refreshToken(request.token());
        return ResponseEntity.ok(new LoginResponse(tokenWithExpiry.token(), tokenWithExpiry.expirationDate()));
    }
}
