package com.nexus.lingustix.Listeners;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.repositories.CompositionSearchRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA Entity Listener that automatically synchronizes the Composition entity
 * with the Elasticsearch search index. This ensures that the search index
 * remains consistent with the database without requiring manual reindexing.
 * 
 * Note: This uses a static field for the repository because JPA entity listeners
 * are instantiated by JPA, not Spring. The null check ensures safety during 
 * application startup before Spring injects the dependency.
 */
@Component
public class CompositionListener {

    private static CompositionSearchRepository compositionSearchRepository;

    @Autowired
    public void setCompositionSearchRepository(CompositionSearchRepository repository) {
        CompositionListener.compositionSearchRepository = repository;
    }

    @PostPersist
    @PostUpdate
    public void onSaveOrUpdate(Composition composition) {
        if (compositionSearchRepository != null) {
            CompositionIndex index = CompositionIndex.builder()
                    .id(composition.getId().toString())
                    .title(composition.getTitle())
                    .content(composition.getContent())
                    .ownerId(composition.getOwner() != null ? composition.getOwner().getId() : null)
                    .build();
            compositionSearchRepository.save(index);
        }
    }

    @PostRemove
    public void onDelete(Composition composition) {
        if (compositionSearchRepository != null) {
            compositionSearchRepository.deleteById(composition.getId().toString());
        }
    }
}
