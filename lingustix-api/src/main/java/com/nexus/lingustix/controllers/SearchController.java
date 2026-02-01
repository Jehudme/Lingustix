package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.services.AccountService;
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
    private  final AccountService accountService;

    @GetMapping("/compositions")
    public ResponseEntity<Page<CompositionIndex>> searchCompositions(@RequestParam String query,
                                                                     @PageableDefault(size = 20) Pageable pageable) {
        UUID ownerId = accountService.getAuthenticatedAccountId();
        return ResponseEntity.ok(searchService.searchCompositions(query, ownerId, pageable));
    }

    /**
     * Fuzzy search endpoint that allows for typos in the search query.
     * This is useful when users misspell words in their search.
     */
    @GetMapping("/compositions/fuzzy")
    public ResponseEntity<Page<CompositionIndex>> fuzzySearchCompositions(@RequestParam String query,
                                                                          @PageableDefault(size = 20) Pageable pageable) {
        UUID ownerId = accountService.getAuthenticatedAccountId();
        return ResponseEntity.ok(searchService.fuzzySearchCompositions(query, ownerId, pageable));
    }
}
