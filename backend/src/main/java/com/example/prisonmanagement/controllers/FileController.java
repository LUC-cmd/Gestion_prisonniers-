package com.example.prisonmanagement.controllers;

import com.example.prisonmanagement.payload.response.MessageResponse;
import com.example.prisonmanagement.services.files.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    // @PreAuthorize("hasAnyRole('ADMIN', 'PERSONNEL', 'MEDECIN')") ← COMMENTÉ/SUPPRIMÉ
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.storeFile(file);
            
            // Construct file download URI
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(fileName.substring(fileName.lastIndexOf("/") + 1))
                    .toUriString();

            return ResponseEntity.ok(new MessageResponse(fileDownloadUri));
        } catch (Exception ex) {
            return ResponseEntity.status(500)
                .body(new MessageResponse("Erreur lors de l'upload du fichier: " + 
                    Objects.requireNonNull(file.getOriginalFilename()) + "! " + ex.getMessage()));
        }
    }
}