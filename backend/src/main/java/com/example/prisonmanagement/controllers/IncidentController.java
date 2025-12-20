package com.example.prisonmanagement.controllers;

import com.example.prisonmanagement.models.Incident;
import com.example.prisonmanagement.repositories.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    @Autowired
    private IncidentRepository incidentRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONNEL', 'MEDECIN')")
    public ResponseEntity<List<Incident>> getAllIncidents() {
        List<Incident> incidents = incidentRepository.findAll();
        return ResponseEntity.ok(incidents);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONNEL')")
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        Incident savedIncident = incidentRepository.save(incident);
        return ResponseEntity.ok(savedIncident);
    }
}
