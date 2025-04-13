package com.example.skilly.Controllers;

import com.example.skilly.DTOs.GithubTokenRequest;
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
import org.springframework.http.*;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

import io.jsonwebtoken.Claims;
import org.springframework.web.client.DefaultResponseErrorHandler;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

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
    public ResponseEntity<?> authenticateGithub(@RequestBody GithubTokenRequest request,
                                                HttpServletResponse response) {
        String code = request.getCode();

        if (usedCodes.contains(code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "code_already_used",
                            "message", "This authorization code has already been used. Please try logging in again."));
        }


        try {
            // Exchange the code for an access token
            String accessToken = exchangeCodeForToken(code);
            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Failed to obtain access token from GitHub");
            }
            usedCodes.add(code); // ✅ Add here only after success

            if (accessToken == null || accessToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Failed to obtain access token from GitHub");
            }

            // Use the access token to get user info
            Map<String, Object> userInfo = getGithubUserInfo(accessToken);

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String pictureUrl = (String) userInfo.get("avatar_url");

            // If email is null (GitHub doesn't always provide email), use login as fallback
            if (email == null) {
                String login = (String) userInfo.get("login");
                email = login + "@github.com"; // Generate a placeholder email
            }

            // Find or create user
            User user = userRepository.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setUsername(name != null ? name : (String) userInfo.get("login"));
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

            return ResponseEntity.ok(Map.of(
                    "user", user,
                    "token", jwtToken));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Authentication failed: " + e.getMessage());
        }
    }

    private String exchangeCodeForToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED); // 🔥 This is the missing piece
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("client_id", clientId);
        map.add("client_secret", clientSecret);
        map.add("code", code);
        map.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);
        RestTemplate restTemplate = new RestTemplate();

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://github.com/login/oauth/access_token",
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            System.out.println("Full GitHub token response: " + response.getBody());

            if (response.getBody().containsKey("error")) {
                System.out.println("GitHub error: " + response.getBody().get("error"));
                System.out.println("Error description: " + response.getBody().get("error_description"));
                return null;
            }

            String accessToken = (String) response.getBody().get("access_token");
            String tokenType = (String) response.getBody().get("token_type");

            System.out.println("Token type: " + tokenType);
            System.out.println("Access token: " + accessToken);

            return accessToken;
        } catch (Exception e) {
            System.out.println("Error exchanging code for token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private Map<String, Object> getGithubUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "token " + accessToken); // MUST be lowercase 'token'
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);
        RestTemplate restTemplate = new RestTemplate();

        // ✅ Optional: skip default error handler to avoid 401 hiding real issues
        restTemplate.setErrorHandler(new DefaultResponseErrorHandler() {
            @Override
            public void handleError(ClientHttpResponse response) throws IOException {
                System.out.println("Raw error body: " + new String(response.getBody().readAllBytes()));
                System.out.println("Status code: " + response.getStatusCode());
                throw new HttpClientErrorException(response.getStatusCode(), response.getStatusText());
            }
        });

        try {
            ResponseEntity<List> emailsResponse = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    requestEntity,
                    List.class
            );

            List<Map<String, Object>> emails = emailsResponse.getBody();
            System.out.println("Emails fetched: " + emails);

            Map<String, Object> userInfo = new HashMap<>();

            if (emails != null && !emails.isEmpty()) {
                Map<String, Object> primaryEmail = emails.stream()
                        .filter(email -> Boolean.TRUE.equals(email.get("primary")))
                        .findFirst()
                        .orElse(emails.get(0));

                userInfo.put("email", primaryEmail.get("email"));
                String email = (String) primaryEmail.get("email");
                String username = email.split("@")[0];
                userInfo.put("name", username);
                userInfo.put("login", username);
                userInfo.put("avatar_url", "https://github.com/identicons/" + username);
            }

            return userInfo;
        } catch (Exception e) {
            System.out.println("Error while fetching GitHub user info: " + e.getMessage());
            e.printStackTrace();
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