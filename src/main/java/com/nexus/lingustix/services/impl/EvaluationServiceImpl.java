package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.entities.Evaluation;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.repositories.EvaluationRepository;
import com.nexus.lingustix.services.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final CompositionRepository compositionRepository;

    @Override
    @Transactional
    public Evaluation create(UUID compositionId) {
        Composition composition = compositionRepository.findById(compositionId)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found"));

        Evaluation evaluation = Evaluation.builder()
                .composition(composition)
                .build();

        return evaluationRepository.save(evaluation);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Evaluation evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found"));
        
        evaluationRepository.deleteById(id);
    }

    @Override
    public boolean verifyOwnership(UUID evaluationId, UUID ownerId) {
        return evaluationRepository.existsByIdAndCompositionOwnerId(evaluationId, ownerId);
    }

    @Override
    public Optional<Evaluation> getById(UUID id) {
        return evaluationRepository.findById(id);
    }

    @Override
    public Optional<Evaluation> getByCompositionId(UUID compositionId) {
        return evaluationRepository.findByCompositionId(compositionId);
    }

}
