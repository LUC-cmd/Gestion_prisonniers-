package com.example.prisonmanagement.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String gravity; // e.g., Faible, Moyenne, Élevée

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detainee_id")
    private Detainee detainee;

    // Could also include a relationship to the User (personnel) who reported it
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "reporter_id")
    // private User reporter;
}
