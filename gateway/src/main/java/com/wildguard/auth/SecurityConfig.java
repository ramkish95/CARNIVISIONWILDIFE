package com.wildguard.auth; // Notice the package is 'auth'

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable()) // Disable CSRF for local testing
        .cors(cors -> cors.configurationSource(request -> {
            var opt = new CorsConfiguration();
            // This allows ANY frontend to talk to your backend
            opt.setAllowedOriginPatterns(List.of("*")); 
            opt.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            opt.setAllowedHeaders(List.of("*"));
            opt.setAllowCredentials(true);
            return opt;
        }))
        .authorizeHttpRequests(auth -> auth
            // Temporarily allow everything so we can find the connection leak
            .requestMatchers("/api/**").permitAll()
            .anyRequest().permitAll()
        )
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    return http.build();
}
}