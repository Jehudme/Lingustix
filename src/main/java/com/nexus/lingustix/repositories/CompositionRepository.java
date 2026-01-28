package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.Composition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompositionRepository extends JpaRepository<Composition, UUID> {}