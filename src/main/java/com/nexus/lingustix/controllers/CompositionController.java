package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compositions")
@RequiredArgsConstructor
public class CompositionController {

    private final CompositionService compositionService;

    @PostMapping
    public ResponseEntity<Composition> create(@RequestParam String title) {
        Composition created = compositionService.create(title);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/title")
    public ResponseEntity<Composition> updateTitle(@PathVariable String id, @RequestParam String title) {
        return ResponseEntity.ok(compositionService.updateTitle(id, title));
    }

    @PatchMapping("/{id}/content")
    public ResponseEntity<Composition> updateContent(@PathVariable String id, @RequestParam String content) {
        return ResponseEntity.ok(compositionService.updateContent(id, content));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        compositionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Composition> getById(@PathVariable String id) {
        return compositionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Composition>> getAll() {
        return ResponseEntity.ok(compositionService.getAll());
    }
}
