package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.requests.*;
import com.nexus.lingustix.models.responses.AccountResponse;
import com.nexus.lingustix.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody AccountCreateRequest request) {
        Account created = accountService.create(request.username(), request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(AccountResponse.from(created));
    }

    @PatchMapping("/email")
    public ResponseEntity<AccountResponse> updateEmail(@Valid @RequestBody AccountUpdateEmailRequest request) {
        return ResponseEntity.ok(AccountResponse.from(
                accountService.updateEmail(accountService.getAuthenticatedAccountId(), request.email())
        ));
    }

    @PatchMapping("/password")
    public ResponseEntity<AccountResponse> updatePassword(@Valid @RequestBody AccountUpdatePasswordRequest request) {
        return ResponseEntity.ok(AccountResponse.from(
                accountService.updatePassword(accountService.getAuthenticatedAccountId(), request.password())
        ));
    }

    @PatchMapping("/username")
    public ResponseEntity<AccountResponse> updateUsername(@Valid @RequestBody AccountUpdateUsernameRequest request) {
        return ResponseEntity.ok(AccountResponse.from(
                accountService.updateUsername(accountService.getAuthenticatedAccountId(), request.username())
        ));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete() {
        accountService.delete(accountService.getAuthenticatedAccountId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getById() {
        return accountService.getById(accountService.getAuthenticatedAccountId())
                .map(AccountResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
