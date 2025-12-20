package com.example.prisonmanagement.repositories;

import com.example.prisonmanagement.models.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    
    // Custom query methods can be added here if needed
    // For example, find incidents by detainee
    List<Incident> findByDetaineeId(Long detaineeId);

}
