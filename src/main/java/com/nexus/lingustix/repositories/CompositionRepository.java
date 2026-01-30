package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.Composition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;

@Repository
public interface CompositionRepository extends JpaRepository<Composition, UUID> {
    Optional<Composition> findByTitleIgnoreCase(String title);
    Page<Composition> findByOwnerId(UUID ownerId, Pageable pageable);
}
