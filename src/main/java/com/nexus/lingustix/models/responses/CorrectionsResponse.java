package com.nexus.lingustix.models.responses;

import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Builder
public record CorrectionsResponse (
    List<Correction> corrections
){
    public CorrectionsResponse() {
        this(new ArrayList<>());
    }
};