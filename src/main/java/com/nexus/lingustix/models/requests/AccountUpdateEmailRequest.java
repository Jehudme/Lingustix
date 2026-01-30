package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountUpdateEmailRequest(
        @Email @NotBlank @Size(max = 255) String email
) {}
