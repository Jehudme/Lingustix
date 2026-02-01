package com.nexus.lingustix.repositories;

import com.nexus.lingustix.models.entities.Account;
import com.nexus.lingustix.models.entities.Composition;
import org.javers.spring.annotation.JaversSpringDataAuditable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
@JaversSpringDataAuditable
public interface CompositionRepository extends JpaRepository<Composition, UUID> {
    @Query("SELECT c.id FROM Composition c WHERE c.owner.id = :ownerId")
    Page<UUID> findIdsByOwnerId(UUID ownerId, Pageable pageable);

    @Query("SELECT c.id FROM Composition c WHERE c.owner.id = :ownerId")
    List<UUID> findIdsByOwnerId(UUID ownerId);

    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);
    Page<Composition> findByOwnerId(UUID ownerId, Pageable pageable);

    UUID owner(Account owner);
}
