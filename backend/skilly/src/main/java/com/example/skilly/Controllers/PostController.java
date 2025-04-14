package com.example.skilly.Controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        return postService.findById(id)
                .map(existingPost -> {
                    post.setId(id);
                    return ResponseEntity.ok(postService.save(post));
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
        return postService.likePost(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlike/{userId}")
    public ResponseEntity<Post> unlikePost(@PathVariable String id, @PathVariable String userId) {
        return postService.unlikePost(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/share/{userId}")
    public ResponseEntity<Post> sharePost(@PathVariable String id, @PathVariable String userId) {
        return postService.sharePost(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}