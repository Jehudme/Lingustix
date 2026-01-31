package com.nexus.lingustix.models.responses;

import lombok.*;

@Builder
public record Correction (
        String original,
        String suggested,
        int startOffset,
        int length,
        String explanation
){};
