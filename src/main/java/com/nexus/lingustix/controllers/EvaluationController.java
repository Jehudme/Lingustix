package com.nexus.lingustix.controllers;

import com.nexus.lingustix.components.GlobalExceptionComponent;
import com.nexus.lingustix.models.requests.EvaluationCreateRequest;
import com.nexus.lingustix.models.responses.Correction;
import com.nexus.lingustix.services.AccountService;
import com.nexus.lingustix.services.CompositionService;
import com.nexus.lingustix.services.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final CompositionService compositionService;
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<List<Correction>> create(@Valid @RequestBody EvaluationCreateRequest request) {
        if (!compositionService.verifyOwnership(request.compositionId(), accountService.getAuthenticatedAccountId()))
            throw new GlobalExceptionComponent.UnauthorizedException("You do not have permission to evaluate this composition.");

        List<Correction> created = evaluationService.create(request.compositionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
