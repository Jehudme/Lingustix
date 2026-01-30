package com.nexus.lingustix.components;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.repositories.CompositionSearchRepository;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CompositionEntityListener {

    private static CompositionSearchRepository compositionSearchRepository;

    @Autowired
    public void setCompositionSearchRepository(CompositionSearchRepository repository) {
        CompositionEntityListener.compositionSearchRepository = repository;
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
