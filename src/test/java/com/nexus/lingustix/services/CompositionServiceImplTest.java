package com.nexus.lingustix.services;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.repositories.AccountRepository;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.impl.CompositionServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

class CompositionServiceImplTest {

    @Test
    void getByOwner_throwsSpecificResource() {
        CompositionRepository compositionRepository = Mockito.mock(CompositionRepository.class);
        AccountRepository accountRepository = Mockito.mock(AccountRepository.class);
        CompositionServiceImpl service = new CompositionServiceImpl(compositionRepository, accountRepository);

        UUID missing = UUID.randomUUID();
        when(accountRepository.findById(missing)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getByOwner(missing))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Owner not found")
                .matches(ex -> ((ResourceNotFoundException) ex).getResource().equals("account"));
    }
}
