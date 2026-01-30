package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.searches.CompositionIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;
import java.util.UUID;

public interface CompositionSearchRepository extends ElasticsearchRepository<CompositionIndex, String> {
    List<CompositionIndex> findByTitleOrContent(String title, String content);

    List<CompositionIndex> findByTitleOrContentAndOwnerId(String title, String content, UUID ownerId);

    Page<CompositionIndex> findByTitleOrContent(String title, String content, Pageable pageable);

    Page<CompositionIndex> findByTitleOrContentAndOwnerId(String title, String content, UUID ownerId, Pageable pageable);
}
