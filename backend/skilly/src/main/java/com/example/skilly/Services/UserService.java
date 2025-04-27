package com.example.skilly.Services;

import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

import com.example.skilly.Exceptions.ResourceNotFoundException;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Initialize follow lists
        user.setFollowing(new ArrayList<>());
        user.setFollowers(new ArrayList<>());
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void followUser(String followerId, String followeeId) {
        User follower = getUserById(followerId);
        User followee = getUserById(followeeId);

        // Check if already following
        if (follower.getFollowing().contains(followeeId)) {
            throw new DataIntegrityViolationException("User is already following this user");
        }

        // Update both users
        follower.getFollowing().add(followeeId);
        followee.getFollowers().add(followerId);

        userRepository.save(follower);
        userRepository.save(followee);
    }

    public void unfollowUser(String followerId, String followeeId) {
        User follower = getUserById(followerId);
        User followee = getUserById(followeeId);

        // Check if not following
        if (!follower.getFollowing().contains(followeeId)) {
            throw new DataIntegrityViolationException("User is not following this user");
        }

        // Update both users
        follower.getFollowing().remove(followeeId);
        followee.getFollowers().remove(followerId);

        userRepository.save(follower);
        userRepository.save(followee);
    }

    public List<User> getFollowers(String userId) {
        User user = getUserById(userId);
        return userRepository.findAllById(user.getFollowers());
    }

    public List<User> getFollowing(String userId) {
        User user = getUserById(userId);
        return userRepository.findAllById(user.getFollowing());
    }

    public User updateUser(User user) {
        // Check if user exists
        if (!userRepository.existsById(user.getId())) {
            throw new ResourceNotFoundException("User not found with id: " + user.getId());
        }

        // Save the updated user
        return userRepository.save(user);
    }
    public User updateUserProfilePicture(String userId, String imageUrl, String publicId) {
        // Get user by ID
        User user = getUserById(userId);

        // Log before values for debugging
        System.out.println("Before update - URL: " + user.getProfilePicUrl() + ", PublicID: " + user.getProfilePicPublicId());

        // Update profile picture URL and public ID
        user.setProfilePicUrl(imageUrl);
        user.setProfilePicPublicId(publicId);

        // Save and return updated user
        User updatedUser = userRepository.save(user);

        // Log after values for debugging
        System.out.println("After update - URL: " + updatedUser.getProfilePicUrl() + ", PublicID: " + updatedUser.getProfilePicPublicId());

        return updatedUser;
    }
}