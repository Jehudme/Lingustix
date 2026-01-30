package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.requests.CompositionCreateRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateContentRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateTitleRequest;
import com.nexus.lingustix.models.responses.CompositionResponse;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

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
    public ResponseEntity<CompositionResponse> updateTitle(@PathVariable UUID id, @Valid @RequestBody CompositionUpdateTitleRequest request) {
        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateTitle(id, request.title())));
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<CompositionResponse> updateContent(@PathVariable UUID id, @Valid @RequestBody CompositionUpdateContentRequest request) {
        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateContent(id, request.content())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        compositionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompositionResponse> getById(@PathVariable UUID id) {
        return compositionService.getById(id)
                .map(CompositionResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<CompositionResponse>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        String currentUserId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID ownerId = UUID.fromString(currentUserId);
        return ResponseEntity.ok(compositionService.getByOwner(ownerId, pageable).map(CompositionResponse::from));
    }
}
