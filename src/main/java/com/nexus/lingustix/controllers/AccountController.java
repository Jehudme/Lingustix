package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.requests.*;
import com.nexus.lingustix.models.responses.AccountResponse;
import com.nexus.lingustix.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
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

    @PatchMapping("/{id}/email")
    public ResponseEntity<AccountResponse> updateEmail(@PathVariable UUID id, @Valid @RequestBody AccountUpdateEmailRequest request) {
        return ResponseEntity.ok(AccountResponse.from(accountService.updateEmail(id, request.email())));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<AccountResponse> updatePassword(@PathVariable UUID id, @Valid @RequestBody AccountUpdatePasswordRequest request) {
        return ResponseEntity.ok(AccountResponse.from(accountService.updatePassword(id, request.password())));
    }

    @PatchMapping("/{id}/username")
    public ResponseEntity<AccountResponse> updateUsername(@PathVariable UUID id, @Valid @RequestBody AccountUpdateUsernameRequest request) {
        return ResponseEntity.ok(AccountResponse.from(accountService.updateUsername(id, request.username())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getById(@PathVariable UUID id) {
        return accountService.getById(id)
                .map(AccountResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getAll() {
        return ResponseEntity.ok(accountService.getAll().stream().map(AccountResponse::from).toList());
    }
}
