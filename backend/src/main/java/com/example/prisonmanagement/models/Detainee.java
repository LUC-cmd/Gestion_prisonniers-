package com.example.prisonmanagement.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "detenus") // French table name
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Detainee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Main Section
    @Column(nullable = false)
    private String lastName; // Nom
    @Column(nullable = false)
    private String firstName; // Prénom
    @Column(nullable = false)
    private LocalDate birthDate; // Date de naissance
    private String birthPlace; // Lieu de naissance
    @Column(nullable = false)
    private String detentionType; // Type de détention (e.g., Préventive, Condamnation, Extradition)
    @Column(nullable = false)
    private LocalDate arrivalDate; // Date d'arrivée
    private String photoUrl; // URL de la photo

    // Tab: Identité
    private String nationality; // Nationalité
    private String identificationNumber; // N° CIN/Passeport
    private String address; // Adresse
    // Using JSON string for family contacts for simplicity, a dedicated entity would be better for complex cases
    @Column(columnDefinition = "TEXT")
    private String familyContactsJson; // Contacts familiaux (JSON: [{name, relation, phone}])

    // Tab: Judiciaire
    @Column(columnDefinition = "TEXT")
    private String offenses; // Infractions
    private String sentence; // Peine
    private LocalDate sentenceDate; // Date de jugement
    private LocalDate expectedEndDate; // Fin de peine prévue
    private String court; // Tribunal
    private String securityLevel; // Niveau de sécurité (e.g., Faible, Moyen, Élevé)
    private LocalDate releaseDate; // Date de sortie effective

    // Tab: Médical
    private String bloodType; // Groupe sanguin
    private String medicalStatus; // État de santé (e.g., Bon, Moyen, Mauvais, Critique)
    @Column(columnDefinition = "TEXT")
    private String allergies; // Allergies
    @Column(columnDefinition = "TEXT")
    private String treatments; // Traitements en cours
    @Column(columnDefinition = "TEXT")
    private String medicalHistory; // Antécédents médicaux

    // Tab: Biométrie
    @Column(columnDefinition = "TEXT")
    private String distinctiveMarks; // Signes distinctifs
    @Column(columnDefinition = "TEXT")
    private String physicalPeculiarities; // Particularités physiques
    // Biometric data (fingerprints, facial recognition) will be links or handled by separate services
    private String fingerprintsUrl;
    private String facialRecognitionUrl;

    // Status for validation (requested by user, implicitly)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DetaineeStatus status = DetaineeStatus.PENDING_VALIDATION; // Default status
    @Column(columnDefinition = "TEXT")
    private String adminComments; // Comments by admin during validation
}
