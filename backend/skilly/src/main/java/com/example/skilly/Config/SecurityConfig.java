package com.example.skilly.Config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.skilly.Services.CustomOAuth2UserService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private CustomOAuth2UserService oAuth2UserService;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable()) // Disable CSRF
                                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                                .authorizeHttpRequests(authz -> authz
                                                .requestMatchers("/", "/login/**", "/oauth2/**", "/api/auth/google")
                                                .permitAll() // Allow access
                                                             // to these
                                                             // URLs
                                                .requestMatchers("/**").permitAll() // Allow all requests (for testing)
                                                .anyRequest().authenticated() // Any other request must be authenticated
                                )
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(oAuth2UserService) // Use custom
                                                                                                // OAuth2UserService
                                                ))
                                .logout(logout -> logout
                                                .logoutSuccessUrl("/") // Redirect to the homepage after logout
                                );
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Already correct
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}