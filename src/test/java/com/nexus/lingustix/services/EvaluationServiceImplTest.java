package com.nexus.lingustix.services;

import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.entities.Evaluation;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.repositories.EvaluationRepository;
import com.nexus.lingustix.services.impl.EvaluationServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class EvaluationServiceImplTest {

    private EvaluationRepository evaluationRepository;
    private CompositionRepository compositionRepository;
    private EvaluationServiceImpl service;

    @BeforeEach
    void setup() {
        evaluationRepository = Mockito.mock(EvaluationRepository.class);
        compositionRepository = Mockito.mock(CompositionRepository.class);
        service = new EvaluationServiceImpl(evaluationRepository, compositionRepository);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void create_allowsOwnerToCreateEvaluation() {
        UUID ownerId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("testuser").email("test@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));
        Evaluation savedEval = Evaluation.builder().id(UUID.randomUUID()).composition(composition).build();
        when(evaluationRepository.save(any(Evaluation.class))).thenReturn(savedEval);

        // Set up security context with the owner's ID
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(ownerId.toString(), null, new ArrayList<>())
        );

        Evaluation result = service.create(compositionId);
        assertThat(result).isNotNull();
    }

    @Test
    void create_throwsWhenUserDoesNotOwnComposition() {
        UUID ownerId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("owner").email("owner@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        // Set up security context with a different user's ID
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.create(compositionId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void create_throwsWhenCompositionHasNoOwner() {
        UUID compositionId = UUID.randomUUID();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(null).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        // Set up security context
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(UUID.randomUUID().toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.create(compositionId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }
}
