package com.nexus.lingustix.models.responses;

import com.nexus.lingustix.models.entities.Account;

import java.util.UUID;

public record AccountResponse(
        UUID id,
        String username,
        String email
) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getUsername(), account.getEmail());
    }
}
