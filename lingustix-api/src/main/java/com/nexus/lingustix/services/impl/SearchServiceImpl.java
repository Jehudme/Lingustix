package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.repositories.CompositionSearchRepository;
import com.nexus.lingustix.services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final CompositionSearchRepository compositionSearchRepository;
    private final CompositionRepository compositionRepository;

    @Override
    public List<CompositionIndex> searchCompositions(String query, UUID ownerId) {
        if (ownerId == null) {
            return compositionSearchRepository.findByTitleOrContent(query, query);
        }
        return compositionSearchRepository.findByTitleOrContentAndOwnerId(query, query, ownerId);
    }

    @Override
    public Page<CompositionIndex> searchCompositions(String query, UUID ownerId, Pageable pageable) {
        if (ownerId == null) {
            return compositionSearchRepository.findByTitleOrContent(query, query, pageable);
        }
        return compositionSearchRepository.findByTitleOrContentAndOwnerId(query, query, ownerId, pageable);
    }

    @Override
    public List<CompositionIndex> fuzzySearchCompositions(String query, UUID ownerId) {
        if (ownerId == null) {
            return compositionSearchRepository.fuzzySearchByTitleOrContent(query);
        }
        return compositionSearchRepository.fuzzySearchByTitleOrContentAndOwnerId(query, ownerId);
    }

    @Override
    public Page<CompositionIndex> fuzzySearchCompositions(String query, UUID ownerId, Pageable pageable) {
        if (ownerId == null) {
            return compositionSearchRepository.fuzzySearchByTitleOrContent(query, pageable);
        }
        return compositionSearchRepository.fuzzySearchByTitleOrContentAndOwnerId(query, ownerId, pageable);
    }

    @Override
    public void reindexComposition(UUID id) {
        compositionRepository.findById(id).ifPresent(composition -> {
            CompositionIndex index = CompositionIndex.builder()
                    .id(composition.getId().toString())
                    .title(composition.getTitle())
                    .content(composition.getContent())
                    .ownerId(composition.getOwner() != null ? composition.getOwner().getId() : null)
                    .build();
            compositionSearchRepository.save(index);
        });
    }

    @Override
    public void rebuildIndex() {
        compositionSearchRepository.deleteAll();
        compositionRepository.findAll().forEach(composition -> {
            CompositionIndex index = CompositionIndex.builder()
                    .id(composition.getId().toString())
                    .title(composition.getTitle())
                    .content(composition.getContent())
                    .ownerId(composition.getOwner() != null ? composition.getOwner().getId() : null)
                    .build();
            compositionSearchRepository.save(index);
        });
    }
}
