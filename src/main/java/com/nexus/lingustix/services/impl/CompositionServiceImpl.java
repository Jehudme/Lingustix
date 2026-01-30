package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompositionServiceImpl implements CompositionService {

    private final CompositionRepository compositionRepository;
    private final AccountRepository accountRepository;

    @Override
    public Composition create(String title) {
        Composition composition = Composition.builder()
                .title(title)
                .content("")
                .build();
        return compositionRepository.save(composition);
    }

    @Override
    public Composition updateTitle(String id, String title) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found"));
        composition.setTitle(title);
        return compositionRepository.save(composition);
    }

    @Override
    public Composition updateContent(String id, String content) {
        Composition composition = getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found"));
        composition.setContent(content);
        return compositionRepository.save(composition);
    }

    @Override
    public void delete(String id) {
        compositionRepository.deleteById(UUID.fromString(id));
    }

    @Override
    public Optional<Composition> getById(String id) {
        return compositionRepository.findById(UUID.fromString(id));
    }

    @Override
    public Optional<Composition> getByTitle(String title) {
        return compositionRepository.findAll().stream()
                .filter(composition -> composition.getTitle().equalsIgnoreCase(title))
                .findFirst();
    }

    @Override
    public List<Composition> getByOwner(String ownerId) {
        Account owner = accountRepository.findById(UUID.fromString(ownerId))
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        return owner.getCompositions();
    }

    @Override
    public List<Composition> getAll() {
        return compositionRepository.findAll();
    }
}
