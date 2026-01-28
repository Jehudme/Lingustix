package com.nexus.lingustix.models.requests;

public record LoginRequest(
        String identifier,
        String password
) {}
