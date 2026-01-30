package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.searches.CompositionIndex;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;
import java.util.UUID;

public interface CompositionSearchRepository extends ElasticsearchRepository<CompositionIndex, String> {
    List<CompositionIndex> findByTitleOrContent(String title, String content);

    List<CompositionIndex> findByTitleOrContentAndOwnerId(String title, String content, UUID ownerId);
}
