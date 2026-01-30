package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Composition;

import java.util.List;
import java.util.Optional;

public interface CompositionService {
    Composition create(String title);
    Composition updateTitle(String id, String title);
    Composition updateContent(String id, String content);
    void delete(String id);

    Optional<Composition> getById(String id);
    Optional<Composition> getByTitle(String title);
    List<Composition> getByOwner(String ownerId);
    List<Composition> getAll();
}
