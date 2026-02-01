package com.nexus.lingustix.services;

import com.nexus.lingustix.models.searches.CompositionIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SearchService {
    List<CompositionIndex> searchCompositions(String query, UUID ownerId);
    Page<CompositionIndex> searchCompositions(String query, UUID ownerId, Pageable pageable);
    
    /**
     * Fuzzy search for compositions allowing for typos in the query.
     * Searches both title and content fields.
     */
    List<CompositionIndex> fuzzySearchCompositions(String query, UUID ownerId);
    
    /**
     * Paginated fuzzy search for compositions allowing for typos in the query.
     * Searches both title and content fields.
     */
    Page<CompositionIndex> fuzzySearchCompositions(String query, UUID ownerId, Pageable pageable);
    
    void reindexComposition(UUID id);
    void rebuildIndex();
}