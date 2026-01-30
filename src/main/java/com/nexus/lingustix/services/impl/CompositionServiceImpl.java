package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.CompositionRepository;
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
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public Composition create(String title) {
        String currentUserId = getCurrentUserId();
        Account owner = accountRepository.findById(UUID.fromString(currentUserId))
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Composition composition = Composition.builder()
                .title(title)
                .content("")
                .owner(owner)
                .build();
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public Composition updateTitle(UUID id, String title) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));
        verifyOwnership(composition);
        composition.setTitle(title);
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public Composition updateContent(UUID id, String content) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));
        verifyOwnership(composition);
        composition.setContent(content);
        return compositionRepository.save(composition);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));
        verifyOwnership(composition);
        compositionRepository.deleteById(id);
    }

    private void verifyOwnership(Composition composition) {
        String currentUserId = getCurrentUserId();
        if (composition.getOwner() == null || !composition.getOwner().getId().toString().equals(currentUserId)) {
            throw new UnauthorizedException("Not authorized to access this composition");
        }
    }

    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (String) authentication.getPrincipal();
    }

    @Override
    public Optional<Composition> getById(UUID id) {
        return compositionRepository.findById(id);
    }

    @Override
    public Optional<Composition> getByTitle(String title) {
        return compositionRepository.findByTitleIgnoreCase(title);
    }

    @Override
    public List<Composition> getByOwner(UUID ownerId) {
        Account owner = accountRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found", "account"));

        return owner.getCompositions();
    }

    @Override
    public Page<Composition> getByOwner(UUID ownerId, Pageable pageable) {
        return compositionRepository.findByOwnerId(ownerId, pageable);
    }

    @Override
    public List<Composition> getAll() {
        return compositionRepository.findAll();
    }
}
