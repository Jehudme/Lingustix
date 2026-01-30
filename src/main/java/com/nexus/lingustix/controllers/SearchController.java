package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.services.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping("/compositions")
    public ResponseEntity<List<CompositionIndex>> searchCompositions(@RequestParam String query,
                                                                     @RequestParam(required = false) UUID ownerId) {
        return ResponseEntity.ok(searchService.searchCompositions(query, ownerId));
    }

    @PostMapping("/compositions/{id}/reindex")
    public ResponseEntity<Void> reindexComposition(@PathVariable UUID id) {
        searchService.reindexComposition(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/compositions/rebuild")
    public ResponseEntity<Void> rebuildIndex() {
        searchService.rebuildIndex();
        return ResponseEntity.ok().build();
    }
}
