package com.nexus.lingustix.services;

import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.services.impl.AccountServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountServiceImplTest {

    private AccountRepository accountRepository;
    private PasswordEncoder passwordEncoder;
    private AccountServiceImpl service;

    @BeforeEach
    void setup() {
        accountRepository = Mockito.mock(AccountRepository.class);
        passwordEncoder = Mockito.mock(PasswordEncoder.class);
        service = new AccountServiceImpl(accountRepository, passwordEncoder);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updateEmail_allowsOwnerToUpdateEmail() {
        UUID accountId = UUID.randomUUID();
        Account account = Account.builder()
                .id(accountId)
                .username("testuser")
                .email("old@example.com")
                .hashedPassword("hashed")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(accountId.toString(), null, new ArrayList<>())
        );

        Account result = service.updateEmail(accountId, "new@example.com");
        assertThat(result.getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void updateEmail_throwsWhenUserDoesNotOwnAccount() {
        UUID accountId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.updateEmail(accountId, "new@example.com"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void updateUsername_allowsOwnerToUpdateUsername() {
        UUID accountId = UUID.randomUUID();
        Account account = Account.builder()
                .id(accountId)
                .username("olduser")
                .email("test@example.com")
                .hashedPassword("hashed")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(accountId.toString(), null, new ArrayList<>())
        );

        Account result = service.updateUsername(accountId, "newuser");
        assertThat(result.getUsername()).isEqualTo("newuser");
    }

    @Test
    void updateUsername_throwsWhenUserDoesNotOwnAccount() {
        UUID accountId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.updateUsername(accountId, "newuser"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void updatePassword_allowsOwnerToUpdatePassword() {
        UUID accountId = UUID.randomUUID();
        Account account = Account.builder()
                .id(accountId)
                .username("testuser")
                .email("test@example.com")
                .hashedPassword("oldHash")
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(passwordEncoder.encode("newpassword")).thenReturn("newHash");
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(accountId.toString(), null, new ArrayList<>())
        );

        Account result = service.updatePassword(accountId, "newpassword");
        assertThat(result.getHashedPassword()).isEqualTo("newHash");
    }

    @Test
    void updatePassword_throwsWhenUserDoesNotOwnAccount() {
        UUID accountId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.updatePassword(accountId, "newpassword"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }

    @Test
    void delete_allowsOwnerToDeleteAccount() {
        UUID accountId = UUID.randomUUID();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(accountId.toString(), null, new ArrayList<>())
        );

        service.delete(accountId);
        verify(accountRepository).deleteById(accountId);
    }

    @Test
    void delete_throwsWhenUserDoesNotOwnAccount() {
        UUID accountId = UUID.randomUUID();
        UUID differentUserId = UUID.randomUUID();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(differentUserId.toString(), null, new ArrayList<>())
        );

        assertThatThrownBy(() -> service.delete(accountId))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Not authorized");
    }
}
