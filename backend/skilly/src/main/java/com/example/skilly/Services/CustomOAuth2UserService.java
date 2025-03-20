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

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String pictureUrl = oauth2User.getAttribute("picture");
        
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
        
        return oauth2User;
    }
}