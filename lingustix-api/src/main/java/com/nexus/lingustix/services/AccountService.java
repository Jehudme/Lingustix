package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountService {
    Account create(String username, String email, String password);
    Account updateEmail(UUID accountId, String newEmail);
    Account updatePassword(UUID accountId, String newPassword);
    Account updateUsername(UUID accountId, String newUsername);
    void delete(UUID accountId);

    UUID getAuthenticatedAccountId();

    Optional<Account> getById(UUID accountId);
    Optional<Account> getByIdentifier(String identifier);}