package com.swp391.horseracing.module.user.service.impl;

import com.swp391.horseracing.core.exception.AppException;
import com.swp391.horseracing.core.exception.ErrorCode;
import com.swp391.horseracing.module.user.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;
import com.swp391.horseracing.module.user.entity.User;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserDetailServiceCustomize implements UserDetailsService{

    UserRepository userRepository;
    
    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    @Override
    public UserDetails loadUserByUsername(String input) throws UsernameNotFoundException {
        if (EMAIL_PATTERN.matcher(input).matches()) {
            User user = userRepository.findByEmail(input);
            if (user == null) {
                throw new AppException(ErrorCode.USER_NOT_FOUND);
            }
            return user;
        } else {
            return userRepository.findByUsername(input)
                   .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }
    }

}
