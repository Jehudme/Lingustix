package com.nexus.lingustix.services;

import com.nexus.lingustix.models.responses.CorrectionsResponse;

import java.util.Optional;
import java.util.UUID;

public interface EvaluationService {
    CorrectionsResponse create(UUID compositionId);
}
