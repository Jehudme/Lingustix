package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.responses.CompositionVersionDTO;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.AccountService;
import com.nexus.lingustix.services.CompositionService;
import lombok.RequiredArgsConstructor;
import org.javers.core.Javers;
import org.javers.repository.jql.QueryBuilder;
import org.javers.shadow.Shadow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompositionServiceImpl implements CompositionService {

    private final CompositionRepository compositionRepository;
    private final AccountService accountService;
    private final Javers javers;

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
        Composition composition = compositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found", "composition"));

        compositionRepository.delete(composition);
    }

    @Override
    public boolean verifyOwnership(UUID compositionId, UUID ownerId) {
        return compositionRepository.existsByIdAndOwnerId(compositionId, ownerId);
    }

    @Override
    public Page<UUID> getIdsByOwner(UUID ownerId, Pageable pageable) {
        return compositionRepository.findIdsByOwnerId(ownerId, pageable);
    }

    @Override
    public Optional<Composition> getById(UUID id) {
        return compositionRepository.findById(id);
    }

    @Override
    public List<UUID> getByOwner(UUID ownerId) {
        return compositionRepository.findIdsByOwnerId(ownerId);
    }

    @Override
    public Page<UUID> getByOwner(UUID ownerId, Pageable pageable) {
        return compositionRepository.findIdsByOwnerId(ownerId, pageable);
    }

    @Override
    public List<CompositionVersionDTO> getHistory(UUID compositionId) {
        // Verify composition exists
        if (!compositionRepository.existsById(compositionId)) {
            throw new ResourceNotFoundException("Composition not found", "composition");
        }

        // Query JaVers for shadows (reconstructed entity at each point in time)
        // Limit to 100 most recent versions to prevent performance issues.
        // For compositions with extensive history, consider implementing pagination
        // in the future via skip/limit parameters exposed through the API.
        List<Shadow<Composition>> shadows = javers.findShadows(
                QueryBuilder.byInstanceId(compositionId, Composition.class)
                        .limit(100)
                        .build()
        );

        // Map shadows to DTOs, filtering out any with null entities
        return shadows.stream()
                .filter(shadow -> shadow.get() != null)
                .map(shadow -> {
                    Composition entity = shadow.get();
                    return new CompositionVersionDTO(
                            shadow.getCommitMetadata().getId().toString(),
                            shadow.getCommitMetadata().getCommitDate(),
                            shadow.getCommitMetadata().getAuthor(),
                            entity.getTitle(),
                            entity.getContent()
                    );
                })
                .collect(Collectors.toList());
    }
}
