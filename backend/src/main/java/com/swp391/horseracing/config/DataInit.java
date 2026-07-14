package com.swp391.horseracing.config;


import com.swp391.horseracing.entity.Role;
import com.swp391.horseracing.entity.User;
import com.swp391.horseracing.mapper.UserMapper;
import com.swp391.horseracing.entity.profile.HorseOwner;
import com.swp391.horseracing.entity.profile.Jockey;
import java.math.BigDecimal;
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

        String[] defaultRoles = {"SPECTATOR", "JOCKEY", "HORSE_OWNER", "ADMIN", "REFEREE"};
        for (String roleName : defaultRoles) {
            if (roleRepository.findByRoleName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().roleName(roleName).build());
                log.info("Role {} is created", roleName);
            }
        }

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

            if(!userRepository.existsByUsername("owner3")) {

            Role ownerRole = roleRepository.findByRoleName("HORSE_OWNER")
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .roleName("HORSE_OWNER")
                                    .build()
                    ));

            HorseOwner owner = HorseOwner.builder()
                    .username("owner3")
                    .email("owner3@gmail.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .status(User.UserStatus.active)
                    .roles(Set.of( ownerRole))
                    .fullName("Horse Owner One")
                    .phone("0123456789")
                    .build();

            userRepository.save(owner);
            log.info("HorseOwner created with username: {} and password: {}", "owner1", "123456");
        }

        if(!userRepository.existsByUsername("jockey4")) {
            Role jockeyRole = roleRepository.findByRoleName("JOCKEY")
                    .orElseGet(() -> roleRepository.save(
                            Role.builder()
                                    .roleName("JOCKEY")
                                    .build()
                    ));

            Jockey jockey = Jockey.builder()
                    .username("jockey4")
                    .email("jockey1@gmail.com")
                    .passwordHash(passwordEncoder.encode("123456"))
                    .status(User.UserStatus.active)
                    .roles(Set.of(jockeyRole))
                    .firstName("John")
                    .lastName("Doe")
                    .fullName("John Doe")
                    .gender("Male")
                    .height(BigDecimal.valueOf(160.5))
                    .weight(55.0f)
                    .experienceYears(3)
                    .jockeyStatus(Jockey.JockeyStatus.approval)
                    .build();

            userRepository.save(jockey);
            log.info("Jockey created with username: {} and password: {}", "jockey1", "123456");
        }
    }



}
