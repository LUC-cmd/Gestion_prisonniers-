package com.example.prisonmanagement.controllers;

import com.example.prisonmanagement.models.ERole;
import com.example.prisonmanagement.models.Role;
import com.example.prisonmanagement.models.User;
import com.example.prisonmanagement.models.UserStatus;
import com.example.prisonmanagement.payload.request.UserRoleUpdateRequest;
import com.example.prisonmanagement.payload.response.MessageResponse;
import com.example.prisonmanagement.repositories.RoleRepository;
import com.example.prisonmanagement.repositories.UserRepository;
import com.example.prisonmanagement.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // All methods in this controller require ADMIN role
public class UserManagementController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    // SessionRegistry removed - JWT is stateless, no session tracking in DB

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔍 DEBUG /users - Auth: " + auth);
        System.out.println("🔍 DEBUG /users - Principal: " + auth.getPrincipal());
        System.out.println("🔍 DEBUG /users - Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/active-users")
    public ResponseEntity<List<String>> getActiveUsers() {
        // Note: With JWT stateless authentication, we don't track active sessions.
        // If you need active user tracking, consider implementing a different solution
        // such as tracking last activity timestamp in the database.
        List<String> activeUsers = List.of(); // Return empty list for now
        return ResponseEntity.ok(activeUsers);
    }

    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long userId,
            @RequestBody UserRoleUpdateRequest roleUpdateRequest) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Erreur : Utilisateur non trouvé !"));
        }

        User user = userOptional.get();
        Set<Role> roles = new HashSet<>();

        // Logic to prevent an admin from removing their own admin role unless there's
        // another admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();

        if (currentUser.getId().equals(userId)
                && currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            if (!roleUpdateRequest.getRoles().contains("ROLE_ADMIN")) {
                long adminCount = userRepository.findAll().stream()
                        .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN))
                        .count();
                if (adminCount <= 1) { // If this is the last admin
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new MessageResponse("Erreur : Impossible de supprimer le dernier rôle ADMIN actif."));
                }
            }
        }

        roleUpdateRequest.getRoles().forEach(roleStr -> {
            ERole eRole = ERole.valueOf(roleStr);
            Role role = roleRepository.findByName(eRole)
                    .orElseThrow(() -> new RuntimeException("Erreur : Le rôle " + eRole + " n'est pas trouvé."));
            roles.add(role);
        });

        user.setRoles(roles);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Rôles de l'utilisateur mis à jour avec succès !"));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestParam UserStatus status) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Erreur : Utilisateur non trouvé !"));
        }

        User user = userOptional.get();

        // Logic to prevent an admin from suspending themselves if they are the last
        // admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl currentUser = (UserDetailsImpl) authentication.getPrincipal();

        if (currentUser.getId().equals(userId) && status == UserStatus.SUSPENDED) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getStatus() == UserStatus.ACTIVE
                            && u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_ADMIN))
                    .count();
            if (adminCount <= 1) { // If this is the last active admin
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Erreur : Impossible de suspendre le dernier administrateur actif."));
            }
        }

        user.setStatus(status);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Statut de l'utilisateur mis à jour avec succès !"));
    }
}
