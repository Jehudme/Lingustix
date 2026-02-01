package com.nexus.lingustix.controllers;

import com.nexus.lingustix.components.GlobalExceptionComponent;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.requests.CompositionCreateRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateContentRequest;
import com.nexus.lingustix.models.requests.CompositionUpdateTitleRequest;
import com.nexus.lingustix.models.responses.CompositionResponse;
import com.nexus.lingustix.services.AccountService;
import com.nexus.lingustix.services.CompositionService;
import com.nexus.lingustix.services.impl.CompositionServiceImpl.CompositionVersionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/compositions")
@RequiredArgsConstructor
public class CompositionController {

    private final CompositionService compositionService;
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<CompositionResponse> create(@Valid @RequestBody CompositionCreateRequest request) {
        UUID ownerId = accountService.getAuthenticatedAccountId();
        Composition created = compositionService.create(ownerId, request.title());
        return ResponseEntity.status(HttpStatus.CREATED).body(CompositionResponse.from(created));
    }

    @PatchMapping("/{id}/title")
    public ResponseEntity<CompositionResponse> updateTitle(@PathVariable UUID id, @Valid @RequestBody CompositionUpdateTitleRequest request) {
        if (!compositionService.verifyOwnership(id, accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to update this composition.");

        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateTitle(id, request.title())));
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<CompositionResponse> updateContent(@PathVariable UUID id, @Valid @RequestBody CompositionUpdateContentRequest request) {
        if (!compositionService.verifyOwnership(id, accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to update this composition.");

        return ResponseEntity.ok(CompositionResponse.from(compositionService.updateContent(id, request.content())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!compositionService.verifyOwnership(id, accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to update this composition.");

        compositionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompositionResponse> getById(@PathVariable UUID id) {
        if (!compositionService.verifyOwnership(id, accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to access this composition.");

        return compositionService.getById(id)
                .map(CompositionResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ids")
    public ResponseEntity<Page<UUID>> getAllIds(@PageableDefault(size = 20) Pageable pageable) {
        UUID ownerId = accountService.getAuthenticatedAccountId();
        return ResponseEntity.ok(compositionService.getIdsByOwner(ownerId, pageable));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<List<CompositionVersionDTO>> getVersions(@PathVariable UUID id) {
        if (!compositionService.verifyOwnership(id, accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to access this composition.");

        List<CompositionVersionDTO> versions = compositionService.getHistory(id);
        return ResponseEntity.ok(versions);
    }
}
