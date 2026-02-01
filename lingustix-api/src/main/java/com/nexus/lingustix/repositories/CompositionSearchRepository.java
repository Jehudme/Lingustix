package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.searches.CompositionIndex;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;
import java.util.UUID;

public interface CompositionSearchRepository extends ElasticsearchRepository<CompositionIndex, String> {
    List<CompositionIndex> findByTitleOrContent(String title, String content);

    List<CompositionIndex> findByTitleOrContentAndOwnerId(String title, String content, UUID ownerId);

    Page<CompositionIndex> findByTitleOrContent(String title, String content, Pageable pageable);

    Page<CompositionIndex> findByTitleOrContentAndOwnerId(String title, String content, UUID ownerId, Pageable pageable);

    /**
     * Fuzzy search on title and content fields allowing for typos.
     * Uses Elasticsearch's fuzziness feature with AUTO setting which allows:
     * - 0 edits for 1-2 character terms
     * - 1 edit for 3-5 character terms
     * - 2 edits for terms longer than 5 characters
     */
    @Query("""
        {
          "bool": {
            "should": [
              { "match": { "title": { "query": "?0", "fuzziness": "AUTO" } } },
              { "match": { "content": { "query": "?0", "fuzziness": "AUTO" } } }
            ],
            "minimum_should_match": 1
          }
        }
        """)
    List<CompositionIndex> fuzzySearchByTitleOrContent(String query);

    /**
     * Fuzzy search on title and content fields filtered by owner ID.
     */
    @Query("""
        {
          "bool": {
            "must": [
              { "term": { "ownerId": "?1" } }
            ],
            "should": [
              { "match": { "title": { "query": "?0", "fuzziness": "AUTO" } } },
              { "match": { "content": { "query": "?0", "fuzziness": "AUTO" } } }
            ],
            "minimum_should_match": 1
          }
        }
        """)
    List<CompositionIndex> fuzzySearchByTitleOrContentAndOwnerId(String query, UUID ownerId);

    /**
     * Paginated fuzzy search on title and content fields.
     */
    @Query("""
        {
          "bool": {
            "should": [
              { "match": { "title": { "query": "?0", "fuzziness": "AUTO" } } },
              { "match": { "content": { "query": "?0", "fuzziness": "AUTO" } } }
            ],
            "minimum_should_match": 1
          }
        }
        """)
    Page<CompositionIndex> fuzzySearchByTitleOrContent(String query, Pageable pageable);

    /**
     * Paginated fuzzy search on title and content fields filtered by owner ID.
     */
    @Query("""
        {
          "bool": {
            "must": [
              { "term": { "ownerId": "?1" } }
            ],
            "should": [
              { "match": { "title": { "query": "?0", "fuzziness": "AUTO" } } },
              { "match": { "content": { "query": "?0", "fuzziness": "AUTO" } } }
            ],
            "minimum_should_match": 1
          }
        }
        """)
    Page<CompositionIndex> fuzzySearchByTitleOrContentAndOwnerId(String query, UUID ownerId, Pageable pageable);
}
