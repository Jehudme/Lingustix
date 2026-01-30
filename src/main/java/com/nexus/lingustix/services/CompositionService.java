package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Composition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompositionService {
    Composition create(String title);
    Composition updateTitle(UUID id, String title);
    Composition updateContent(UUID id, String content);
    void delete(UUID id);

    Optional<Composition> getById(UUID id);
    Optional<Composition> getByTitle(String title);
    List<Composition> getByOwner(UUID ownerId);
    Page<Composition> getByOwner(UUID ownerId, Pageable pageable);
    List<Composition> getAll();
}
