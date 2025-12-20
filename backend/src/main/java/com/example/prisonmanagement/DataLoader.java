package com.example.prisonmanagement;

import com.example.prisonmanagement.models.ERole;
import com.example.prisonmanagement.models.Role;
import com.example.prisonmanagement.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataLoader(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
        }
        if (roleRepository.findByName(ERole.ROLE_MEDECIN).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_MEDECIN));
        }
        if (roleRepository.findByName(ERole.ROLE_PERSONNEL).isEmpty()) {
            roleRepository.save(new Role(null, ERole.ROLE_PERSONNEL));
        }
    }
}
