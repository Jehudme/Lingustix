package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefreshTokenRequest(
        @NotBlank @Size(min = 10, max = 500) String token
) {}
