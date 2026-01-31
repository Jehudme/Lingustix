package com.nexus.lingustix.services.impl;

import com.nexus.lingustix.components.GlobalExceptionComponent.ResourceNotFoundException;
import com.nexus.lingustix.models.entities.Composition;
import com.nexus.lingustix.models.responses.Correction;
import com.nexus.lingustix.repositories.CompositionRepository;
import com.nexus.lingustix.services.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final CompositionRepository compositionRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${languagetool.url:http://localhost:8081/v2}")
    private String languageToolUrl;

    @Override
    @Transactional
    public List<Correction> create(UUID compositionId) {
        Composition composition = compositionRepository.findById(compositionId)
                .orElseThrow(() -> new ResourceNotFoundException("Composition not found"));

        LanguageToolResponse response = restClient.post()
                .uri(languageToolUrl + "/check")
                .body("text=" + composition.getContent() + "&language=auto")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .retrieve()
                .body(LanguageToolResponse.class);

        if (response != null && response.matches() != null) {
            List<Correction> corrections = response.matches().stream()
                    .map(match -> Correction.builder()
                            .original(composition.getContent().substring(match.offset(), match.offset() + match.length()))
                            .suggested(match.replacements().isEmpty() ? "" : match.replacements().getFirst().get("value"))
                            .startOffset(match.offset())
                            .length(match.length())
                            .explanation(match.message())
                            .build())
                    .collect(Collectors.toList());

            return corrections;
        }

        throw new RuntimeException("LanguageTool returned no matches");
    }

    /**
     * DTOs for parsing LanguageTool JSON response
     */
    private record LanguageToolResponse(List<Match> matches, DetectedLanguage language) {}
    private record DetectedLanguage(String name, String code) {}
    private record Match(int offset, int length, String message, List<Map<String, String>> replacements) {}
}
