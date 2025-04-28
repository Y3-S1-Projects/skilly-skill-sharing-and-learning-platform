package com.example.skilly.Controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.example.skilly.DTOs.LikeNotification;
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
    public ResponseEntity<Post> createPost(
            @RequestParam("postType") String postType,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestHeader("Authorization") String token) throws IOException {

        // Extract userId from token (typically would use a JWT service)
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));

        Post post = new Post();
        post.setUserId(userId);
        post.setTitle(title);
        post.setPostType(postType);
        post.setContent(description);
        post.setCreatedAt(new Date());
        post.setLikes(new ArrayList<>());
        post.setSharedBy(new ArrayList<>());
        post.setComments(new ArrayList<>());

        // Handle file uploads and save URLs
        List<String> mediaUrls = new ArrayList<>();
        if (images != null) {
            for (MultipartFile image : images) {
                String imageUrl = postService.uploadImage(image);
                mediaUrls.add(imageUrl);
            }
        }
        post.setMediaUrls(mediaUrls);

        return ResponseEntity.status(HttpStatus.CREATED).body(postService.save(post));
    }

    

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
            @PathVariable String id,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {

        return postService.findById(id)
                .map(existingPost -> {
                    existingPost.setTitle(title);
                    existingPost.setContent(description);
                    return ResponseEntity.ok(postService.save(existingPost));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        return postService.findById(id)
                .map(post -> {
                    postService.deleteById(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/like/{userId}")
    public ResponseEntity<Post> likePost(@PathVariable String id, @PathVariable String userId) {
        System.out.println("Like request received: Post=" + id + ", User=" + userId);

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
                .map(ResponseEntity::ok)
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