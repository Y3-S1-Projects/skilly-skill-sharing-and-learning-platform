package com.example.skilly.Controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.skilly.Config.CloudinaryConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.skilly.Exceptions.ResourceNotFoundException;
import com.example.skilly.Models.User;
import com.example.skilly.Payload.MessageResponse;
import com.example.skilly.Services.UserService;
import com.example.skilly.Services.CloudinaryService;
import com.example.skilly.Utils.JwtUtil;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving users: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Email already in use"));
            }

            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Invalid data: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating user: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting user: " + e.getMessage()));
        }
    }

    @GetMapping("/id")
    public ResponseEntity<?> getUserId(@RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            Map<String, String> response = new HashMap<>();
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error retrieving user ID: " + e.getMessage()));
        }
    }

    @GetMapping("/role")
    public ResponseEntity<?> getUserRole(@RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userRole = jwtUtil.getUserRoleFromToken(jwtToken);

            Map<String, String> response = new HashMap<>();
            response.put("role", userRole);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error retrieving user role: " + e.getMessage()));
        }
    }

    @GetMapping("/details")
    public ResponseEntity<?> getUserDetails(@RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user details: " + e.getMessage()));
        }
    }

    @PostMapping("/follow/{targetUserId}")
    public ResponseEntity<?> followUser(
            @PathVariable String targetUserId,
            @RequestHeader(value = "Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String authenticatedUserId = jwtUtil.getUserIdFromToken(jwtToken);

            userService.followUser(authenticatedUserId, targetUserId);
            return ResponseEntity.ok(new MessageResponse("Successfully followed user"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error following user: " + e.getMessage()));
        }
    }

    @PostMapping("/unfollow/{targetUserId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String targetUserId,
            @RequestHeader(value = "Authorization") String token) {
        try {
            // Validate token
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String authenticatedUserId = jwtUtil.getUserIdFromToken(jwtToken);

            userService.unfollowUser(authenticatedUserId, targetUserId);
            return ResponseEntity.ok(new MessageResponse("Successfully unfollowed user"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error unfollowing user: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String userId) {
        try {
            List<User> followers = userService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving followers: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String userId) {
        try {
            List<User> following = userService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving following list: " + e.getMessage()));
        }
    }
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            // Get the existing user
            User user = userService.getUserById(userId);

            // Update fields
            if (updates.containsKey("username")) {
                user.setUsername((String) updates.get("username"));
            }

            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }

            if (updates.containsKey("bio")) {
                user.setBio((String) updates.get("bio"));
            }

            if (updates.containsKey("profilePicUrl")) {
                user.setProfilePicUrl((String) updates.get("profilePicUrl"));
            }

            if (updates.containsKey("skills") && updates.get("skills") instanceof List) {
                @SuppressWarnings("unchecked")
                List<String> skills = (List<String>) updates.get("skills");
                user.setSkills(skills);
            }

            // Save the updated user
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating user: " + e.getMessage()));
        }
    }
    @PostMapping("/upload-profile-pic")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "Authorization") String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            // Get current user
            User user = userService.getUserById(userId);
            System.out.println("Current user profile picture: " + user.getProfilePicUrl());
            System.out.println("Current user profile picture publicId: " + user.getProfilePicPublicId());

            // Store the old public ID, if it exists
            String oldPublicId = user.getProfilePicPublicId();

            // Upload new image
            Map<String, String> uploadResult = cloudinaryService.uploadFile(file);
            String imageUrl = uploadResult.get("url");
            String publicId = uploadResult.get("public_id");

            System.out.println("New image uploaded - URL: " + imageUrl + ", PublicID: " + publicId);

            // Update user with new image details
            User updatedUser = userService.updateUserProfilePicture(userId, imageUrl, publicId);
            System.out.println("User updated with new profile picture");

            // Only after successful upload and database update, try to delete the old image
            if (oldPublicId != null && !oldPublicId.isEmpty()) {
                System.out.println("Attempting to delete old image with publicId: " + oldPublicId);
                boolean deleted = cloudinaryService.deleteFile(oldPublicId);
                System.out.println("Old image deletion result: " + deleted);
            } else {
                System.out.println("No old image publicId to delete");
            }

            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error uploading image: " + e.getMessage()));
        }
    }
}