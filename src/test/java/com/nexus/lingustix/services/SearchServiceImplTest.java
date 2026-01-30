package com.nexus.lingustix.services;

import com.nexus.lingustix.models.searches.CompositionIndex;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.repositories.CompositionSearchRepository;
import com.nexus.lingustix.services.impl.SearchServiceImpl;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

class SearchServiceImplTest {

    @Test
    void searchCompositions_filtersByOwnerInQuery() {
        CompositionSearchRepository searchRepository = Mockito.mock(CompositionSearchRepository.class);
        CompositionRepository compositionRepository = Mockito.mock(CompositionRepository.class);
        SearchServiceImpl service = new SearchServiceImpl(searchRepository, compositionRepository);

        UUID ownerId = UUID.randomUUID();
        CompositionIndex owned = CompositionIndex.builder().id("1").title("t").content("c").ownerId(ownerId).build();
        when(searchRepository.findByTitleOrContentAndOwnerId("q", "q", ownerId)).thenReturn(List.of(owned));

        List<CompositionIndex> result = service.searchCompositions("q", ownerId);

        assertThat(result).containsExactly(owned);
    }

    @Test
    void searchCompositions_withoutOwnerUsesGenericQuery() {
        CompositionSearchRepository searchRepository = Mockito.mock(CompositionSearchRepository.class);
        CompositionRepository compositionRepository = Mockito.mock(CompositionRepository.class);
        SearchServiceImpl service = new SearchServiceImpl(searchRepository, compositionRepository);

        CompositionIndex any = CompositionIndex.builder().id("2").title("t").content("c").ownerId(null).build();
        when(searchRepository.findByTitleOrContent("q", "q")).thenReturn(List.of(any));

        List<CompositionIndex> result = service.searchCompositions("q", null);

        assertThat(result).containsExactly(any);
    }
}
