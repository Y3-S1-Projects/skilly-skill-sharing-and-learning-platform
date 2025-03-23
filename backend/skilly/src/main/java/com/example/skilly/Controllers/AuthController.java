package com.example.skilly.Controllers;

import com.example.skilly.DTOs.LoginRequest;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.UserRepository;
import com.example.skilly.Services.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @GetMapping("/user")
    public Map<String, Object> user(@AuthenticationPrincipal OAuth2User principal) {
        return Map.of(
                "name", principal.getAttribute("name"),
                "email", principal.getAttribute("email"),
                "picture", principal.getAttribute("picture"));
    }

    @GetMapping("/user-details")
    public ResponseEntity<?> getUserDetails(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // Don't use @CookieValue to avoid problems with Google's cookies
        String token = null;

        System.out.println("Checking cookies in user-details request:");
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                System.out.println("Cookie: " + c.getName() + " = " + c.getValue());
            }
        } else {
            System.out.println("No cookies found in user-details request");
        }
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // Try to extract token from Authorization header if cookie is not present
        if (token == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            System.out.println("Using token from Authorization header");
        }

        System.out.println("Token status: " + (token != null ? "Present" : "Not present"));

        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Validate the token and extract user ID and role
            String userId = jwtService.extractUserId(token);
            String userRole = jwtService.extractUserRole(token);

            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            return ResponseEntity.ok(Map.of(
                    "userId", userId,
                    "userRole", userRole));
        } catch (Exception e) {
            System.out.println("Token validation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateGoogle(@RequestBody GoogleTokenRequest request, HttpServletResponse response,
            HttpServletRequest servletRequest) {

        try {
            // Verify the Google token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getToken());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token or expired token");
            }

            // Extract user info
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // Find or create user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setUsername(name);
                user.setProfilePicUrl(pictureUrl);
                user.setRegistrationDate(LocalDateTime.now());
                user.setRole("USER");
                user.setFollowing(new ArrayList<>());
                user.setFollowers(new ArrayList<>());
                user.setSkills(new ArrayList<>());
                userRepository.save(user);
            }

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user);

            // Use a different name for your cookie to avoid conflicts
            // Cookie authCookie = new Cookie("auth_token", jwtToken);
            // authCookie.setHttpOnly(true);
            // authCookie.setPath("/");
            // authCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days

            // authCookie.setSecure(false); // Set to true if using HTTPS

            // response.addCookie(authCookie);

            return ResponseEntity.ok(Map.of(
                    "user", user,
                    "token", jwtToken));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        try {
            // Find user by email
            User user = userRepository.findByEmail(loginRequest.getEmail());

            if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
            }

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user);

            // Send token in response
            return ResponseEntity.ok(Map.of(
                    "user", user,
                    "token", jwtToken));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Login failed: " + e.getMessage());
        }
    }

}

// DTO for Google token request
class GoogleTokenRequest {
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}