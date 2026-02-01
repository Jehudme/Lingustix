package com.nexus.lingustix.models.responses;

import java.time.LocalDateTime;

/**
 * DTO representing a version of a Composition at a specific point in time.
 */
public record CompositionVersionDTO(
        String commitId,
        LocalDateTime timestamp,
        String author,
        String title,
        String content
) {}
