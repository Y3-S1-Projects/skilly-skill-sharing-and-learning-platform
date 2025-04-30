package com.example.skilly.Config;

import java.util.List;

import com.example.skilly.Models.User;
import com.example.skilly.Repositories.UserRepository;
import com.example.skilly.Services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
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

        @Autowired
        private JwtService jwtService;

        @Autowired
        private UserRepository userRepository;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                        .csrf(csrf -> csrf.disable()) // Disable CSRF
                        .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                        .authorizeHttpRequests(authz -> authz
                                .requestMatchers("/", "/login/**", "/oauth2/**", "/api/auth/**", "/error")
                                .permitAll() // Allow access to these URLs
                                .requestMatchers("/**").permitAll() // Allow all requests (for testing)
                                .anyRequest().authenticated() // Any other request must be authenticated
                        )
                        .oauth2Login(oauth2 -> oauth2
                                .authorizationEndpoint(authorization -> authorization
                                        .baseUri("/oauth2/authorization") // This matches the frontend redirect
                                )
                                .redirectionEndpoint(redirection -> redirection
                                        .baseUri("/login/oauth2/code/*") // Default Spring OAuth callback
                                )
                                .userInfoEndpoint(userInfo -> userInfo
                                        .userService(oAuth2UserService) // Use custom OAuth2UserService
                                )
                                .successHandler((request, response, authentication) -> {
                                        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

                                        // Extract user details from OAuth2 user
                                        String email = oauthUser.getAttribute("email");
                                        String name = oauthUser.getAttribute("name");

                                        // Find or create user in your database
                                        User user = userRepository.findByEmail(email);
                                        if (user == null) {
                                                // Create new user if doesn't exist
                                                user = new User();
                                                user.setEmail(email);
                                                user.setUsername(name != null ? name : email.split("@")[0]);
                                                user.setRole("USER"); // Default role
                                                user = userRepository.save(user);
                                        }

                                        // Generate JWT token
                                        String token = jwtService.generateToken(user);

                                        // Redirect to frontend with token
                                        response.sendRedirect("http://localhost:5173/login-success?token=" + token);
                                })
                                .failureHandler((request, response, exception) -> {
                                        response.sendRedirect("http://localhost:5173/login?error=oauth_failed");
                                })
                        )
                        .logout(logout -> logout
                                .logoutSuccessUrl("http://localhost:5173") // Redirect to frontend after logout
                                .invalidateHttpSession(true)
                                .clearAuthentication(true)
                                .deleteCookies("JSESSIONID")
                        );
                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                ));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setExposedHeaders(List.of("Authorization"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}