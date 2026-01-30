package com.nexus.lingustix.controllers;

import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.services.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<Account> create(@RequestParam String username,
                                          @RequestParam String email,
                                          @RequestParam String password) {
        Account created = accountService.create(username, email, password);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/email")
    public ResponseEntity<Account> updateEmail(@PathVariable UUID id, @RequestParam String email) {
        return ResponseEntity.ok(accountService.updateEmail(id, email));
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Account> updatePassword(@PathVariable UUID id, @RequestParam String password) {
        return ResponseEntity.ok(accountService.updatePassword(id, password));
    }

    @PatchMapping("/{id}/username")
    public ResponseEntity<Account> updateUsername(@PathVariable UUID id, @RequestParam String username) {
        return ResponseEntity.ok(accountService.updateUsername(id, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getById(@PathVariable UUID id) {
        return accountService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Account>> getAll() {
        return ResponseEntity.ok(accountService.getAll());
    }
}
