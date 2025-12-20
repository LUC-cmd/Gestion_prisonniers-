package com.example.prisonmanagement.repositories;

import com.example.prisonmanagement.models.Detainee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetaineeRepository extends JpaRepository<Detainee, Long> {
}
