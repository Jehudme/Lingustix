package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Account;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountService {
    Account create(String username, String email, String password);
    Account updateEmail(UUID id, String newEmail);
    Account updatePassword(UUID id, String newPassword);
    Account updateUsername(UUID id, String newUsername);
    void delete(UUID id);

    Optional<Account> getById(UUID id);
    Optional<Account> getByIdentifier(String identifier);
    List<Account> getAll();
}