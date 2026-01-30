package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountUpdatePasswordRequest(
        @NotBlank @Size(min = 8, max = 255) String password
) {}
