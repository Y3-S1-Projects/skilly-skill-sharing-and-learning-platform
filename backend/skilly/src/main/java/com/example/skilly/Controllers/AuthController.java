package com.example.skilly.Controllers;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.skilly.DTOs.GithubTokenRequest;
import com.example.skilly.DTOs.LoginRequest;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.UserRepository;
import com.example.skilly.Services.JwtService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.github.redirect-uri}")
    private String redirectUri;

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

    private Set<String> usedCodes = Collections.synchronizedSet(new HashSet<>());

    @PostMapping("/github")
    public ResponseEntity<?> authenticateGithub(@RequestBody GithubTokenRequest request) {
        if (usedCodes.contains(request.getCode())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "code_already_used",
                            "message", "This authorization code has already been used"));
        }
        try {
            String accessToken = exchangeCodeForToken(request.getCode());
            Map<String, Object> userInfo = getGithubUserInfo(accessToken);

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            if (name == null) {
                name = (String) userInfo.get("login");
            }
            String pictureUrl = (String) userInfo.get("avatar_url");

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

            String jwtToken = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of(
                    "user", user,
                    "token", jwtToken));
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "invalid_code",
                                "message", "The GitHub authorization code is invalid or expired"));
            }
            throw e;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("GitHub authentication failed: " + e.getMessage());
        }
    }

    private String exchangeCodeForToken(String code) throws HttpClientErrorException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, String> requestBody = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret,
                "code", code,
                "redirect_uri", redirectUri
        );

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();

        // Add error handler to properly parse GitHub errors
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                if (response.getStatusCode() == HttpStatus.BAD_REQUEST) {
                    String errorBody = new String(response.getBody().readAllBytes());
                    throw new HttpClientErrorException(response.getStatusCode(), errorBody);
                }
                super.handleError(response);
            }
        });

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://github.com/login/oauth/access_token",
                HttpMethod.POST,
                request,
                Map.class);

        if (response.getBody().containsKey("error")) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST,
                    (String) response.getBody().get("error_description"));
        }

        return (String) response.getBody().get("access_token");
    }

    private Map<String, Object> getGithubUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken); // Proper way to set Bearer token
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            // First get user info
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://api.github.com/user",
                    HttpMethod.GET,
                    requestEntity,
                    Map.class);

            Map<String, Object> userInfo = userResponse.getBody();
            System.out.println("User info fetched: " + userInfo);

            // Then get emails
            ResponseEntity<List> emailsResponse = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    requestEntity,
                    List.class);

            List<Map<String, Object>> emails = emailsResponse.getBody();
            System.out.println("Emails fetched: " + emails);

            // Find primary email
            if (emails != null && !emails.isEmpty()) {
                Map<String, Object> primaryEmail = emails.stream()
                        .filter(email -> Boolean.TRUE.equals(email.get("primary")))
                        .findFirst()
                        .orElse(emails.get(0));

                userInfo.put("email", primaryEmail.get("email"));
            }

            // If no email found, use login as fallback
            if (userInfo.get("email") == null) {
                String login = (String) userInfo.get("login");
                userInfo.put("email", login + "@github.com");
            }

            return userInfo;
        } catch (Exception e) {
            System.out.println("Error while fetching GitHub user info: " + e.getMessage());
            throw new RuntimeException("GitHub user info fetch failed", e);
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