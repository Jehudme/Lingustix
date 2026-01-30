package com.nexus.lingustix.services;

import com.nexus.lingustix.models.searches.CompositionIndex;
import java.util.List;
import java.util.UUID;

public interface SearchService {
    List<CompositionIndex> searchCompositions(String query, UUID ownerId);
    void reindexComposition(UUID id);
    void rebuildIndex();
}