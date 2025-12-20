package com.example.prisonmanagement.controllers;

import com.example.prisonmanagement.models.Detainee;
import com.example.prisonmanagement.models.DetaineeStatus;
import com.example.prisonmanagement.repositories.DetaineeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/detainees")
public class DetaineeController {

    private static final Logger logger = LoggerFactory.getLogger(DetaineeController.class);

    @Autowired
    DetaineeRepository detaineeRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONNEL', 'MEDECIN')") // Any authenticated user can add for now, refine later
    public ResponseEntity<Detainee> createDetainee(@RequestBody Detainee detainee) {
        // Ensure status is PENDING_VALIDATION on creation
        detainee.setStatus(DetaineeStatus.PENDING_VALIDATION);
        Detainee savedDetainee = detaineeRepository.save(detainee);
        return ResponseEntity.ok(savedDetainee);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PERSONNEL', 'MEDECIN')") // Any authenticated user can view
    public ResponseEntity<List<Detainee>> getAllDetainees() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Inside getAllDetainees - Authentication object: {}", authentication);
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            logger.error("DANGER: User is ANONYMOUS or not authenticated inside controller method!");
        } else {
            logger.info("User {} is properly authenticated with roles {}", authentication.getName(), authentication.getAuthorities());
        }
        
        List<Detainee> detainees = detaineeRepository.findAll();
        return ResponseEntity.ok(detainees);
    }

    // Endpoint for Admin to validate/reject detainees
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')") // Only ADMIN can change status
    public ResponseEntity<Detainee> updateDetaineeStatus(@PathVariable Long id, @RequestParam DetaineeStatus status, @RequestBody(required = false) String adminComments) {
        return detaineeRepository.findById(id)
                .map(detainee -> {
                    detainee.setStatus(status);
                    detainee.setAdminComments(adminComments);
                    return ResponseEntity.ok(detaineeRepository.save(detainee));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
