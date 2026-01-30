package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Evaluation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvaluationService {
    Evaluation create(UUID compositionId);
    void delete(UUID id);

    Optional<Evaluation> getById(UUID id);
    Optional<Evaluation> getByCompositionId(UUID compositionId);
    List<Evaluation> getAll();
}
