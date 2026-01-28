package com.nexus.lingustix.models.responses;

import java.time.LocalDateTime;

public record LoginResponse(
        String token,
        LocalDateTime expirationDate
)
{}
