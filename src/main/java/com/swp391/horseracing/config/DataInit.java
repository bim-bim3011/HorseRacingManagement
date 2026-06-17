package com.swp391.horseracing.config;


import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.mapper.UserMapper;
import com.swp391.horseracing.repository.RoleRepository;
import com.swp391.horseracing.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Slf4j
public class DataInit implements CommandLineRunner {


    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {




        if(!userRepository.existsByUsername("admin")) {
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .roleName("ADMIN")
                                    .build()
                    ));

            User admin = User.builder()
                    .username("admin")
                    .email("admin@gmail.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .status(User.UserStatus.active)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
            log.info("user with name admin are created with username: {} and password: {}",
                    "admin","123456");
        }


    }



}
