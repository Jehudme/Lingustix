package com.nexus.lingustix.services;

import com.nexus.lingustix.models.entities.Account;

import java.util.Optional;
import java.util.UUID;

public interface AccountService {
    Account create(String username, String email, String password);
    void updateEmail(UUID id, String newEmail);
    void updatePassword(UUID id, String newPassword);
    void updateUsername(UUID id, String newUsername);
    void delete(UUID id);

    Optional<Account> getById(UUID id);
    Optional<Account> getByUsernameOrEmail(String identifier);
}