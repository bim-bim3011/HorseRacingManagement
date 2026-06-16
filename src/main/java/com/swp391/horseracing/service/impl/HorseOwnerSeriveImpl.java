package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.repository.HorseOwnerRepository;
import com.swp391.horseracing.service.HorseOwnerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
@RequiredArgsConstructor
@Slf4j
public class HorseOwnerSeriveImpl implements HorseOwnerService {

    HorseOwnerRepository horseOwnerRepository;

}
