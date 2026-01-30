package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.searches.CompositionIndex;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import java.util.List;

public interface CompositionSearchRepository extends ElasticsearchRepository<CompositionIndex, String> {
    List<CompositionIndex> findByTitleOrContent(String title, String content);
}