package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.AccountService;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompositionServiceImpl implements CompositionService {

    private final CompositionRepository compositionRepository;
    private final AccountService accountService;

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @Override
    @Transactional
    public Composition create(UUID ownerId, String title) {
        Account owner = accountService.getById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        
        Composition composition = Composition.builder()
                .title(title)
                .content("")
                .owner(owner)
                .build();
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public Composition updateTitle(UUID compositionId, String title) {
        Composition composition = getById(compositionId)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));
        composition.setTitle(title);
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public Composition updateContent(UUID id, String content) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));

        composition.setContent(content);
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));
        compositionRepository.deleteById(id);
    }

    @Override
    public boolean verifyOwnership(UUID compositionId, UUID ownerId) {
        return compositionRepository.existsByIdAndOwnerId(compositionId, ownerId);
    }

    @Override
    public Optional<Composition> getById(UUID id) {
        return compositionRepository.findById(id);
    }

    @Override
    public List<Composition> getByOwner(UUID ownerId) {
        Account owner = accountService.getById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found", "account"));

        return owner.getCompositions();
    }

    @Override
    public Page<Composition> getByOwner(UUID ownerId, Pageable pageable) {
        return compositionRepository.findByOwnerId(ownerId, pageable);
    }
}
