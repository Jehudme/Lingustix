package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.repositories.CompositionSearchRepository;
import com.nexus.lingustix.services.SearchService;
import lombok.RequiredArgsConstructor;
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
        return compositionSearchRepository.findByTitleOrContent(query, query)
                .stream()
                .filter(index -> ownerId == null || ownerId.equals(index.getOwnerId()))
                .toList();
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
