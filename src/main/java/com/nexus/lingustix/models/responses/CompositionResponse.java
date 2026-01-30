package com.nexus.lingustix.models.responses;

import com.nexus.lingustix.models.entities.Composition;

import java.util.UUID;

public record CompositionResponse(
        UUID id,
        String title,
        String content,
        UUID ownerId
) {
    public static CompositionResponse from(Composition composition) {
        return new CompositionResponse(
                composition.getId(),
                composition.getTitle(),
                composition.getContent(),
                composition.getOwner() != null ? composition.getOwner().getId() : null
        );
    }
}
