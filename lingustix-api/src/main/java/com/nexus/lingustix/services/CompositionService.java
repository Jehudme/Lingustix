package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.responses.CompositionVersionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompositionService {
    Composition create(UUID ownerId, String title);
    Composition updateTitle(UUID ownerId, String title);
    Composition updateContent(UUID ownerId, String content);
    void delete(UUID id);

    boolean verifyOwnership(UUID compositionId, UUID ownerId);

    Page<UUID> getIdsByOwner(UUID ownerId, Pageable pageable);
    Optional<Composition> getById(UUID id);
    List<UUID> getByOwner(UUID ownerId);
    Page<UUID> getByOwner(UUID ownerId, Pageable pageable);

    List<CompositionVersionDTO> getHistory(UUID compositionId);
}
