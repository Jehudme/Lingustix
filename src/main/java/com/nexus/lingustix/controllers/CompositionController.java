package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.requests.CompositionCreateRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateContentRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateTitleRequest;
import com.nexus.lingustix.models.responses.CompositionResponse;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/compositions")
@RequiredArgsConstructor
public class CompositionController {

    private final CompositionService compositionService;

    @PostMapping
    public ResponseEntity<CompositionResponse> create(@Valid @RequestBody CompositionCreateRequest request) {
        Composition created = compositionService.create(request.title());
        return ResponseEntity.status(HttpStatus.CREATED).body(CompositionResponse.from(created));
    }

    @PatchMapping("/{id}/title")
    public ResponseEntity<CompositionResponse> updateTitle(@PathVariable String id, @Valid @RequestBody CompositionUpdateTitleRequest request) {
        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateTitle(id, request.title())));
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<CompositionResponse> updateContent(@PathVariable String id, @Valid @RequestBody CompositionUpdateContentRequest request) {
        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateContent(id, request.content())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        compositionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompositionResponse> getById(@PathVariable String id) {
        return compositionService.getById(id)
                .map(CompositionResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CompositionResponse>> getAll() {
        return ResponseEntity.ok(compositionService.getAll().stream().map(CompositionResponse::from).toList());
    }
}
