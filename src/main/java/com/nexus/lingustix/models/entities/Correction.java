package com.nexus.lingustix.models.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Correction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String original;

    @Column(nullable = false)
    private String suggested;

    @Column(name = "start_offset", nullable = false)
    private int startOffset;

    @Column(nullable = false)
    private int length;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Evaluation evaluation;
}