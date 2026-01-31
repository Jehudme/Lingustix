package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {
    Optional<Evaluation> findByCompositionId(UUID compositionId);
    boolean existsByIdAndCompositionOwnerId(UUID id, UUID compositionOwnerId);
}
