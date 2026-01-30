package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompositionUpdateTitleRequest(
        @NotBlank @Size(min = 1, max = 255) String title
) {}
