package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.Correction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CorrectionRepository extends JpaRepository<Correction, UUID> {}