package com.example.prisonmanagement.controllers;

import com.example.prisonmanagement.config.security.jwt.JwtUtils;
import com.example.prisonmanagement.models.ERole;
import com.example.prisonmanagement.models.Role;
import com.example.prisonmanagement.models.User;
import com.example.prisonmanagement.models.UserStatus;
import com.example.prisonmanagement.payload.request.LoginRequest;
import com.example.prisonmanagement.payload.request.SignupRequest;
import com.example.prisonmanagement.payload.response.JwtResponse;
import com.example.prisonmanagement.payload.response.MessageResponse;
import com.example.prisonmanagement.repositories.RoleRepository;
import com.example.prisonmanagement.repositories.UserRepository;
import com.example.prisonmanagement.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        AuthenticationManager authenticationManager;

        @Autowired
        UserRepository userRepository;

        @Autowired
        RoleRepository roleRepository;

        @Autowired
        PasswordEncoder encoder;

        @Autowired
        JwtUtils jwtUtils;

        @PostMapping("/signin")
        public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                if (userDetails.getStatus() == UserStatus.SUSPENDED) {
                        return ResponseEntity
                                        .status(403)
                                        .body(new MessageResponse("Erreur : Votre compte est suspendu."));
                }

                User user = userRepository.findById(userDetails.getId()).orElseThrow(
                                () -> new RuntimeException(
                                                "Erreur : Utilisateur introuvable après authentification !"));

                user.setLastLoginDate(LocalDateTime.now());
                userRepository.save(user);

                Set<String> roles = userDetails.getAuthorities().stream()
                                .map(item -> item.getAuthority())
                                .collect(Collectors.toSet());

                return ResponseEntity.ok(new JwtResponse(
                                jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getEmail(),
                                roles,
                                userDetails.getStatus(),
                                "Utilisateur connecté avec succès !"));
        }

        @PostMapping("/signup")
        public ResponseEntity<?> registerUser(@RequestBody SignupRequest signupRequest) {
                if (userRepository.existsByUsername(signupRequest.getUsername())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Erreur : Ce nom d'utilisateur est déjà pris !"));
                }

                if (userRepository.existsByEmail(signupRequest.getEmail())) {
                        return ResponseEntity
                                        .badRequest()
                                        .body(new MessageResponse("Erreur : Cet email est déjà utilisé !"));
                }

                User user = new User(signupRequest.getUsername(),
                                signupRequest.getEmail(),
                                encoder.encode(signupRequest.getPassword()));

                Set<Role> roles = new HashSet<>();

                // Logic for initial admin creation (first registered user with username
                // "admin")
                if (userRepository.count() == 0 && signupRequest.getUsername().equals("admin")) {
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Erreur : Le rôle ADMIN n'est pas trouvé."));
                        roles.add(adminRole);
                        user.setRoles(roles); // Assign admin role
                        userRepository.save(user);
                        return ResponseEntity.ok(new MessageResponse("Administrateur enregistré avec succès !"));
                } else {
                        // New users register without roles, pending admin assignment
                        // User entity constructor sets status to ACTIVE by default
                        user.setRoles(roles); // Set empty roles
                        userRepository.save(user);
                        return ResponseEntity.ok(new MessageResponse(
                                        "Utilisateur enregistré avec succès, en attente d'attribution de rôle par un administrateur."));
                }
        }
}
