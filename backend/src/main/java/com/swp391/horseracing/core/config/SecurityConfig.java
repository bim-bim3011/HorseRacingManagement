package com.swp391.horseracing.core.config;

import com.swp391.horseracing.module.user.service.impl.UserDetailServiceCustomize;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

        private final UserDetailServiceCustomize userDetailsService;

        private final String[] PUBLIC_ENDPOINTS = {

                        "/api/auth/**",
                        "/api/register/**",
                        "/api/auth/logout",
                        "/home/**",

                        "/swagger-ui.html",
                        "/swagger-ui/**",

                        "/v3/api-docs",
                        "/v3/api-docs/**",

                        "/ws/**"

        };

        private final String[] TEST_ENDPOINTS = {

                        "/api/test/**",
                        "/api/payment/**",
                        "/api/admin/users/test"

        };

        @Bean
        public SecurityFilterChain configure(HttpSecurity http,
                        CustomJwtDecoder jwtDecoder,
                        JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) throws Exception {

                http

                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/tournaments/**",
                                                                "/api/race-entries/race/**",
                                                                "/api/races/*/bet-odds")
                                                .permitAll()
                                                .requestMatchers(TEST_ENDPOINTS).permitAll()
                                                .anyRequest().authenticated()

                                )

                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.decoder(jwtDecoder))
                                                .authenticationEntryPoint(jwtAuthenticationEntryPoint));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authenticationManager() {
                DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider(userDetailsService);
                authenticationProvider.setPasswordEncoder(passwordEncoder());

                return new ProviderManager(authenticationProvider);
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                // config.setAllowedOrigins(List.of("http://localhost:3000",
                // "http://localhost:5173"));
                config.setAllowedOriginPatterns(List.of("*"));

                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/api/**", config);
                source.registerCorsConfiguration("/ws/**", config);
                return source;
        }

}
