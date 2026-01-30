package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompositionUpdateContentRequest(
        @NotBlank String content
) {}
