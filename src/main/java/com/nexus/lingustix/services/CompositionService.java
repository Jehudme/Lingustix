package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Composition;
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

    Optional<Composition> getById(UUID id);
    List<Composition> getByOwner(UUID ownerId);
    Page<Composition> getByOwner(UUID ownerId, Pageable pageable);

}
