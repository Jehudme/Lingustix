package com.nexus.lingustix.services;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.impl.CompositionServiceImpl;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CompositionServiceImplTest {

    private CompositionRepository compositionRepository;
    private AccountService accountService;
    private CompositionServiceImpl service;

    @BeforeEach
    void setup() {
        compositionRepository = Mockito.mock(CompositionRepository.class);
        accountService = Mockito.mock(AccountService.class);
        service = new CompositionServiceImpl(compositionRepository, accountService);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getByOwner_throwsSpecificResource() {
        UUID missing = UUID.randomUUID();
        when(accountService.getById(missing)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByOwner(missing))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Owner not found")
                .matches(ex -> ((ResourceNotFoundException) ex).getResource().equals("account"));
    }

    @Test
    void updateTitle_allowsOwnerToUpdate() {
        UUID ownerId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("testuser").email("test@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Original").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));
        when(compositionRepository.save(any(Composition.class))).thenReturn(composition);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(ownerId.toString(), null, new ArrayList<>())
        );

        Composition result = service.updateTitle(compositionId, "New Title");
        assertThat(result).isNotNull();
        verify(compositionRepository).save(any(Composition.class));
    }

    @Test
    void updateTitle_throwsWhenUserDoesNotOwnComposition() {
        UUID ownerId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("owner").email("owner@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.updateTitle(compositionId, "New Title"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void updateContent_throwsWhenUserDoesNotOwnComposition() {
        UUID ownerId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("owner").email("owner@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.updateContent(compositionId, "New Content"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void delete_throwsWhenUserDoesNotOwnComposition() {
        UUID ownerId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("owner").email("owner@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.delete(compositionId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void delete_allowsOwnerToDelete() {
        UUID ownerId = UUID.randomUUID();
        UUID compositionId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("testuser").email("test@example.com").build();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").owner(owner).build();

        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(ownerId.toString(), null, new ArrayList<>())
        );

        service.delete(compositionId);
        verify(compositionRepository).deleteById(compositionId);
    }

    @Test
    void create_assignsOwnerToComposition() {
        UUID ownerId = UUID.randomUUID();
        Account owner = Account.builder().id(ownerId).username("testuser").email("test@example.com").build();
        
        when(accountService.getById(ownerId)).thenReturn(Optional.of(owner));
        when(compositionRepository.save(any(Composition.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(ownerId.toString(), null, new ArrayList<>())
        );

        Composition result = service.create(ownerId,"Test Title");
        assertThat(result.getOwner()).isEqualTo(owner);
        assertThat(result.getTitle()).isEqualTo("Test Title");
        verify(compositionRepository).save(any(Composition.class));
    }

    @Test
    void updateTitle_throwsWhenUserNotAuthenticated() {
        UUID compositionId = UUID.randomUUID();
        Composition composition = Composition.builder().id(compositionId).title("Test").content("content").build();
        
        when(compositionRepository.findById(compositionId)).thenReturn(Optional.of(composition));

        // No authentication set
        assertThatThrownBy(() -> service.updateTitle(compositionId, "New Title"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("User not authenticated");
    }
}
