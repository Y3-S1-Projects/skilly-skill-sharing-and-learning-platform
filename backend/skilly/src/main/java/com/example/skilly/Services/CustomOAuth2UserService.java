package com.example.skilly.Services;

import com.example.skilly.Models.User;
import com.example.skilly.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        Map<String, Object> attributes = oauth2User.getAttributes();
        String pictureUrl = (String)attributes.get("avatar_url");
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

        } else {
            user.setUsername(name);
            user.setProfilePicUrl(pictureUrl);
        }
        userRepository.save(user);
        return oauth2User;
    }

    private User processOAuth2User(String registrationId, Map<String, Object> attributes) {
        String email;
        String name;
        String pictureUrl;

        if ("google".equals(registrationId)) {
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            pictureUrl = (String) attributes.get("picture");
        } else if ("github".equals(registrationId)) {
            email = (String) attributes.get("email");
            if (email == null) {
                email = attributes.get("login") + "@github.com";
            }
            name = (String) attributes.get("name");
            if (name == null) {
                name = (String) attributes.get("login");
            }
            pictureUrl = (String) attributes.get("avatar_url");
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        // Validate required fields
        if (email == null || email.isEmpty()) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

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
            user = userRepository.save(user);
        } else {
            // Update user info if needed
            boolean updated = false;
            if (name != null && !name.equals(user.getUsername())) {
                user.setUsername(name);
                updated = true;
            }
            if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicUrl())) {
                user.setProfilePicUrl(pictureUrl);
                updated = true;
            }
            if (updated) {
                user = userRepository.save(user);
            }
        }

        return user;
    }
}