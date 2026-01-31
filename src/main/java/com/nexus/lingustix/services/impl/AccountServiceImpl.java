package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ConflictException;
import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.components.GlobalExceptionComponent.UnauthorizedException;
import com.nexus.lingustix.components.GlobalExceptionComponent.BadRequestException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public Account create(String username, String email, String password) {
        if (accountRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email already in use");
        }

        if (accountRepository.findByUsername(username).isPresent()) {
            throw new ConflictException("Username already in use");
        }

        Account account = Account.builder()
                .username(username)
                .email(email)
                .hashedPassword(passwordEncoder.encode(password))
                .build();

        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public Account updateEmail(UUID id, String newEmail) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setEmail(newEmail);
        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public Account updatePassword(UUID id, String newPassword) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setHashedPassword(passwordEncoder.encode(newPassword));
        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public Account updateUsername(UUID id, String newUsername) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        account.setUsername(newUsername);
        return accountRepository.save(account);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        accountRepository.deleteById(id);
    }

    @Override
    public UUID getAuthenticatedAccountId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getPrincipal() == null ||
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }

        try {
            return UUID.fromString((String) authentication.getPrincipal());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid user ID format in token");
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
    public Optional<Account> getById(UUID id) {
        return accountRepository.findById(id);
    }

    @Override
    public Optional<Account> getByIdentifier(String identifier) {
        return accountRepository.findByEmail(identifier)
                .or(() -> accountRepository.findByUsername(identifier));
    }

    @Override
    public List<Account> getAll() {
        return accountRepository.findAll();
    }
}
