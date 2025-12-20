package com.example.prisonmanagement.payload.response;

import com.example.prisonmanagement.models.UserStatus;
import lombok.Data;

import java.util.Set;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private UserStatus status;
    private String message;

    public JwtResponse(String token, Long id, String username, String email, Set<String> roles, UserStatus status, String message) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.status = status;
        this.message = message;
    }
}