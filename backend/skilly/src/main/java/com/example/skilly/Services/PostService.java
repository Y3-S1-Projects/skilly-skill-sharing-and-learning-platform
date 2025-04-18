package com.example.skilly.Services;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.skilly.Models.Post;
import com.example.skilly.Repositories.PostRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public List<Post> findAll() {
        return postRepository.findAll();
    }

    public Optional<Post> findById(String id) {
        return postRepository.findById(id);
    }

    public List<Post> findByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public Post save(Post post) {
        return postRepository.save(post);
    }

    public void deleteById(String id) {
        postRepository.deleteById(id);
    }

    public Optional<Post> likePost(String id, String userId) {
        return postRepository.findById(id).map(post -> {
            if (!post.getLikes().contains(userId)) {
                post.getLikes().add(userId);
                return postRepository.save(post);
            }
            return post;
        });
    }

    public Optional<Post> unlikePost(String id, String userId) {
        return postRepository.findById(id).map(post -> {
            post.getLikes().remove(userId);
            return postRepository.save(post);
        });
    }

    public Optional<Post> sharePost(String id, String userId) {
        return postRepository.findById(id).map(post -> {
            if (!post.getSharedBy().contains(userId)) {
                post.getSharedBy().add(userId);
                return postRepository.save(post);
            }
            return post;
        });
    }

    public String uploadImage(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate unique filename
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, filename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Return the URL or path that can be used to access the file
        return "/uploads/" + filename;
    }
}