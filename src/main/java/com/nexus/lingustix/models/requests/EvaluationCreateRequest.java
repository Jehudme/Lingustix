package com.nexus.lingustix.models.requests;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record EvaluationCreateRequest(
        @NotNull UUID compositionId
) {}
