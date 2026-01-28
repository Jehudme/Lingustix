package com.nexus.lingustix.configurations;

import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurationContext;
import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurer;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SearchConfig implements LuceneAnalysisConfigurer {
    @Override
    public void configure(LuceneAnalysisConfigurationContext context) {
        context.analyzer("english").custom()
                .tokenizer("standard")
                .tokenFilter("wordDelimiterGraph")
                .tokenFilter("lowercase")
                .tokenFilter("asciiFolding")
                .tokenFilter("snowballPorter");

        context.normalizer("lowercase").custom()
                .tokenFilter("lowercase")
                .tokenFilter("asciiFolding");
    }
}