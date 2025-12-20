package com.example.prisonmanagement.payload.request;

import lombok.Data;

import java.util.Set;

@Data
public class UserRoleUpdateRequest {
    private Set<String> roles; // e.g., ["ROLE_ADMIN", "ROLE_PERSONNEL"]
}
