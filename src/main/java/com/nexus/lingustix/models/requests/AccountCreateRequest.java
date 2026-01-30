package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountCreateRequest(
        @NotBlank @Size(min = 3, max = 50) String username,
        @Email @NotBlank @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 255) String password
) {}
