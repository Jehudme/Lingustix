package com.nexus.lingustix.services;

import com.nexus.lingustix.models.responses.Correction;

import java.util.List;
import java.util.UUID;

public interface EvaluationService {
    List<Correction> create(UUID compositionId);
}
