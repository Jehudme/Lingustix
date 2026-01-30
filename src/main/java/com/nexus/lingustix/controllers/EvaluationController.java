package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Evaluation;
import com.nexus.lingustix.models.requests.EvaluationCreateRequest;
import com.nexus.lingustix.services.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<Evaluation> create(@Valid @RequestBody EvaluationCreateRequest request) {
        Evaluation created = evaluationService.create(request.compositionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        evaluationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Evaluation> getById(@PathVariable UUID id) {
        return evaluationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/composition/{compositionId}")
    public ResponseEntity<Evaluation> getByComposition(@PathVariable UUID compositionId) {
        return evaluationService.getByCompositionId(compositionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Evaluation>> getAll() {
        return ResponseEntity.ok(evaluationService.getAll());
    }
}
