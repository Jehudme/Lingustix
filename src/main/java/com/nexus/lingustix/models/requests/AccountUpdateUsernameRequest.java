package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountUpdateUsernameRequest(
        @NotBlank @Size(min = 3, max = 50) String username
) {}
