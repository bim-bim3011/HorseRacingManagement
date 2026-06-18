package com.swp391.horseracing.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/api/horse-owner")
@Tag(name= "Horse Owner Management",description= "APIs for managing horse owner accounts, " +
        "profiles, horses, race registrations, and jockey invitations")
public class HorseOwnerController {
    
}
