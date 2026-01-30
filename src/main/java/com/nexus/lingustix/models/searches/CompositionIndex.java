package com.nexus.lingustix.models.searches;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "compositions")
@Setting(settingPath = "elasticsearch-settings.json")
public class CompositionIndex {

    @Id
    private String id; // Use String for Elasticsearch IDs

    @Field(type = FieldType.Text, analyzer = "english_analyzer")
    private String title;

    @Field(type = FieldType.Text, analyzer = "english_analyzer")
    private String content;

    private UUID ownerId;
}