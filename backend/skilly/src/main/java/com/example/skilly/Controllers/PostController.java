package com.example.skilly.Controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.example.skilly.DTOs.CommentNotification;
import com.example.skilly.DTOs.LikeNotification;
import com.example.skilly.Models.PostType;
import com.example.skilly.Services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.skilly.DTOs.CommentRequest;
import com.example.skilly.Models.Post;
import com.example.skilly.Services.PostService;
import com.example.skilly.Utils.JwtUtil;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationController notificationController;

    @Autowired
    private UserService userService;


    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return postService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getPostsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(postService.findByUserId(userId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(
            @RequestParam("postType") PostType postType,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestHeader("Authorization") String token) {

        try {
            // Extract userId from token
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

            // Get username from user service
            String username = userService.getUserById(userId).getUsername();

            // Validate image count
            if (images != null && images.length > 3) {
                return ResponseEntity.badRequest().body("Maximum 3 images are allowed per post");
            }

            // Create post with media
            Post post = postService.createPost(userId, username, title, description, postType, images, video);

            return ResponseEntity.status(HttpStatus.CREATED).body(post);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating post: " + e.getMessage());
        }
    }



    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "postType", required = false) PostType postType,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "video", required = false) MultipartFile video,
            @RequestHeader("Authorization") String token) {

        try {
            // Extract userId from token
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

            // Get the existing post
            Optional<Post> existingPostOpt = postService.findById(id);

            if (!existingPostOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Post existingPost = existingPostOpt.get();

            // Check if the post belongs to the user
            if (!existingPost.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only update your own posts");
            }

            // Create updated post object
            Post updatedPost = new Post();
            updatedPost.setTitle(title != null ? title : existingPost.getTitle());
            updatedPost.setContent(description != null ? description : existingPost.getContent());
            updatedPost.setPostType(postType != null ? postType : existingPost.getPostType());

            // Validate image count
            if (images != null && images.length > 3) {
                return ResponseEntity.badRequest().body("Maximum 3 images are allowed per post");
            }

            // Update post
            Optional<Post> result = postService.updatePost(id, updatedPost, images, video);

            return result.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating post: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        try {
            // Extract userId from token
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

            // Get the existing post
            Optional<Post> existingPostOpt = postService.findById(id);

            if (!existingPostOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Post existingPost = existingPostOpt.get();

            // Check if the post belongs to the user
            if (!existingPost.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only delete your own posts");
            }

            // Delete post and associated media
            postService.deleteById(id);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting post: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/save/{userId}")
    public ResponseEntity<?> toggleSavePost(@PathVariable String id, @PathVariable String userId) {
        Optional<Post> updatedPost = postService.toggleSavePost(id, userId);
        return updatedPost
                .map(post -> ResponseEntity.ok().body(post))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}/like/{userId}")
    public ResponseEntity<Post> likePost(@PathVariable String id, @PathVariable String userId) {
        return postService.likePost(id, userId)
                .map(post -> {
                    // Only send notification if the post owner is not the same person who liked
                    if (!post.getUserId().equals(userId)) {
                        try {
                            System.out.println("Sending LIKE notification from " + userId + " to " + post.getUserId());

                            LikeNotification notification = new LikeNotification();
                            notification.setPostId(id);
                            notification.setSenderId(userId);
                            notification.setAction("LIKE");

                            notificationController.sendNotificationToUser(post.getUserId(), notification);
                            System.out.println("Notification sent successfully");
                        } catch (Exception e) {
                            // Log error but don't prevent the like from being processed
                            System.err.println("Error sending notification: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("No notification needed - user liked their own post");
                    }
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlike/{userId}")
    public ResponseEntity<Post> unlikePost(@PathVariable String id, @PathVariable String userId) {
        return postService.unlikePost(id, userId)
                .map(post -> {
                    // Only send notification if the post owner is not the same person who unliked
                    if (!post.getUserId().equals(userId)) {
                        try {
                            LikeNotification notification = new LikeNotification();
                            notification.setPostId(id);
                            notification.setSenderId(userId);
                            notification.setAction("UNLIKE");
                            notificationController.sendNotificationToUser(post.getUserId(), notification);
                        } catch (Exception e) {
                            // Log error but don't prevent the unlike from being processed
                            System.err.println("Error sending notification: " + e.getMessage());
                        }
                    }
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/{id}/share")
    public ResponseEntity<?> sharePost(
            @PathVariable String id,
            @RequestHeader("Authorization") String token) {

        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        try {
            return postService.sharePost(id, userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sharing post");
        }
    }
    // Comment endpoints
    @PostMapping("/{id}/comments")
    public ResponseEntity<Post> addComment(
            @PathVariable String id,
            @RequestBody CommentRequest commentRequest,
            @RequestHeader("Authorization") String token) {

        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        return postService.addComment(id, userId, commentRequest.getContent())
                .map(post -> {
                    // Only send notification if the post owner is not the same person who commented
                    if (!post.getUserId().equals(userId)) {
                        try {
                            System.out.println("Sending COMMENT notification from " + userId + " to " + post.getUserId());

                            CommentNotification notification = new CommentNotification();
                            notification.setPostId(id);
                            notification.setSenderId(userId);
                            notification.setCommentContent(commentRequest.getContent());

                            notificationController.sendCommentNotificationToUser(post.getUserId(), notification);
                            System.out.println("Comment notification sent successfully");
                        } catch (Exception e) {
                            // Log error but don't prevent the comment from being processed
                            System.err.println("Error sending comment notification: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("No notification needed - user commented on their own post");
                    }
                    return ResponseEntity.ok(post);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Post> updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestBody CommentRequest commentRequest,
            @RequestHeader("Authorization") String token) {

        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        return postService.updateComment(id, commentId, userId, commentRequest.getContent())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Post> deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token) {

        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        return postService.deleteComment(id, commentId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}