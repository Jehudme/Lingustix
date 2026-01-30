package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/compositions")
    public ResponseEntity<Page<CompositionIndex>> searchCompositions(@RequestParam String query,
                                                                     @RequestParam(required = false) UUID ownerId,
                                                                     @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(searchService.searchCompositions(query, ownerId, pageable));
    }

    @PostMapping("/compositions/{id}/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reindexComposition(@PathVariable UUID id) {
        searchService.reindexComposition(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/compositions/rebuild")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rebuildIndex() {
        searchService.rebuildIndex();
        return ResponseEntity.ok().build();
    }
}
