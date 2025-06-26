package com.example.skilly.Services;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

import com.example.skilly.Models.PostType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.skilly.Models.Comment;
import com.example.skilly.Models.Post;
import com.example.skilly.Repositories.PostRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public List<Post> findAll() {
        return postRepository.findAllByOrderByCreatedAtDesc();
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
        postRepository.findById(id).ifPresent(post -> {
            // Delete all associated media first
            deletePostMedia(post);
            // Then delete the post
            postRepository.deleteById(id);
        });
    }

    public Optional<Post> toggleSavePost(String id, String userId) {
        return postRepository.findById(id).map(post -> {
            List<String> savedBy = post.getSavedBy();
            if (savedBy.contains(userId)) {
                savedBy.remove(userId);
            } else {
                savedBy.add(userId);
            }
            return postRepository.save(post);
        });
    }

    public List<Post> getSavedPostsByUser(String userId){
        return postRepository.findBySavedByContaining(userId);
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
        return postRepository.findById(id).map(originalPost -> {
            // Prevent sharing own posts
            if (originalPost.getUserId().equals(userId)) {
                throw new IllegalArgumentException("You cannot share your own post");
            }

            // Check if the user has already shared this post
            if (originalPost.getSharedBy().contains(userId)) {
                throw new IllegalArgumentException("You have already shared this post");
            }

            // Create a new post that's a share of the original
            Post sharedPost = new Post();
            sharedPost.setUserId(userId);
            sharedPost.setOriginalPostId(originalPost.getId());
            sharedPost.setOriginalUserId(originalPost.getUserId());
            sharedPost.setOriginalUsername(originalPost.getUsername());
            sharedPost.setTitle(originalPost.getTitle());
            sharedPost.setContent(originalPost.getContent());
            sharedPost.setMediaUrls(originalPost.getMediaUrls());
            sharedPost.setPostType(originalPost.getPostType());
            sharedPost.setCreatedAt(new Date());
            sharedPost.setLikes(new ArrayList<>());
            sharedPost.setSharedBy(new ArrayList<>());
            sharedPost.setComments(new ArrayList<>());

            // Save the shared post
            Post savedSharedPost = postRepository.save(sharedPost);

            // Update the original post's sharedBy list
            originalPost.getSharedBy().add(userId);
            postRepository.save(originalPost);

            return savedSharedPost;
        });
    }

    public String uploadImage(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            boolean dirCreated = directory.mkdirs();
            if (!dirCreated) {
                throw new IOException("Failed to create upload directory");
            }
        }

        // Generate unique filename
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, filename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Return the URL or path that can be used to access the file
        return "/uploads/" + filename;
    }

    public List<Map<String, String>> uploadPostImages(MultipartFile[] files) throws IOException {
        // Check if we have more than 3 images
        if (files.length > 3) {
            throw new IllegalArgumentException("Maximum 3 images are allowed per post");
        }

        List<Map<String, String>> results = new ArrayList<>();
        for (MultipartFile file : files) {
            // Check if file is an image
            if (!file.getContentType().startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed");
            }

            Map<String, String> uploadResult = cloudinaryService.uploadFile(file, "post_images");
            results.add(uploadResult);
        }
        return results;
    }

    public Map<String, String> uploadPostVideo(MultipartFile file) throws IOException {
        // Check if file is a video
        if (!file.getContentType().startsWith("video/")) {
            throw new IllegalArgumentException("Only video files are allowed");
        }

        // Upload with resource_type set to video
        return cloudinaryService.uploadVideo(file, "post_videos");
    }

    public Post createPost(String userId, String username, String title, String content,
                           PostType postType, MultipartFile[] images, MultipartFile video) throws IOException {
        Post post = new Post();
        post.setUserId(userId);
        post.setUsername(username);
        post.setTitle(title);
        post.setContent(content);
        post.setPostType(postType);
        post.setCreatedAt(new Date());
        post.setLikes(new ArrayList<>());
        post.setSharedBy(new ArrayList<>());
        post.setComments(new ArrayList<>());

        // Handle image uploads
        if (images != null && images.length > 0) {
            List<Map<String, String>> imageResults = uploadPostImages(images);

            List<String> mediaUrls = new ArrayList<>();
            List<String> mediaPublicIds = new ArrayList<>();

            for (Map<String, String> result : imageResults) {
                mediaUrls.add(result.get("url"));
                mediaPublicIds.add(result.get("public_id"));
            }

            post.setMediaUrls(mediaUrls);
            post.setMediaPublicIds(mediaPublicIds);
        }

        // Handle video upload
        if (video != null && !video.isEmpty()) {
            Map<String, String> videoResult = uploadPostVideo(video);
            post.setVideoUrl(videoResult.get("url"));
            post.setVideoPublicId(videoResult.get("public_id"));
            post.setVideoDuration(Integer.parseInt(videoResult.getOrDefault("duration", "0")));

            // Check if video exceeds 30 seconds
            if (post.getVideoDuration() > 30) {
                // Delete the uploaded video since it exceeds the limit
                cloudinaryService.deleteFile(post.getVideoPublicId());
                throw new IllegalArgumentException("Video duration exceeds the 30-second limit");
            }
        }

        return postRepository.save(post);
    }

    public void deletePostMedia(Post post) {
        // Delete images
        if (post.getMediaPublicIds() != null && !post.getMediaPublicIds().isEmpty()) {
            for (String publicId : post.getMediaPublicIds()) {
                cloudinaryService.deleteFile(publicId);
            }
        }

        // Delete video
        if (post.getVideoPublicId() != null && !post.getVideoPublicId().isEmpty()) {
            cloudinaryService.deleteFile(post.getVideoPublicId());
        }
    }

    public Optional<Post> updatePost(String id, Post updatedPost, MultipartFile[] newImages, MultipartFile newVideo) {
        try {
            return postRepository.findById(id).map(existingPost -> {
                // Update basic fields if they're provided in updatedPost
                if (updatedPost.getTitle() != null) {
                    existingPost.setTitle(updatedPost.getTitle());
                }
                if (updatedPost.getContent() != null) {
                    existingPost.setContent(updatedPost.getContent());
                }
                if (updatedPost.getPostType() != null) {
                    existingPost.setPostType(updatedPost.getPostType());
                }

                // Handle new image uploads if provided
                if (newImages != null && newImages.length > 0) {
                    try {
                        // Delete old images first
                        if (existingPost.getMediaPublicIds() != null) {
                            for (String publicId : existingPost.getMediaPublicIds()) {
                                cloudinaryService.deleteFile(publicId);
                            }
                        }

                        // Upload new images
                        List<Map<String, String>> imageResults = uploadPostImages(newImages);

                        List<String> mediaUrls = new ArrayList<>();
                        List<String> mediaPublicIds = new ArrayList<>();

                        for (Map<String, String> result : imageResults) {
                            mediaUrls.add(result.get("url"));
                            mediaPublicIds.add(result.get("public_id"));
                        }

                        existingPost.setMediaUrls(mediaUrls);
                        existingPost.setMediaPublicIds(mediaPublicIds);
                    } catch (IOException e) {
                        System.err.println("Failed to upload new images: " + e.getMessage());
                    }
                }

                // Handle new video upload if provided
                if (newVideo != null && !newVideo.isEmpty()) {
                    try {
                        // Delete old video first
                        if (existingPost.getVideoPublicId() != null) {
                            cloudinaryService.deleteFile(existingPost.getVideoPublicId());
                        }

                        // Upload new video
                        Map<String, String> videoResult = uploadPostVideo(newVideo);
                        existingPost.setVideoUrl(videoResult.get("url"));
                        existingPost.setVideoPublicId(videoResult.get("public_id"));
                        existingPost.setVideoDuration(Integer.parseInt(videoResult.getOrDefault("duration", "0")));

                        // Check if video exceeds 30 seconds
                        if (existingPost.getVideoDuration() > 30) {
                            // Delete the uploaded video since it exceeds the limit
                            cloudinaryService.deleteFile(existingPost.getVideoPublicId());
                            throw new IllegalArgumentException("Video duration exceeds the 30-second limit");
                        }
                    } catch (IOException e) {
                        System.err.println("Failed to upload new video: " + e.getMessage());
                    }
                }

                return postRepository.save(existingPost);
            });
        } catch (Exception e) {
            System.err.println("Error updating post: " + e.getMessage());
            return Optional.empty();
        }
    }

    // Comment operations
    public Optional<Post> addComment(String postId, String userId, String content) {
        return postRepository.findById(postId).map(post -> {
            Comment comment = new Comment();
            comment.setId(UUID.randomUUID().toString());
            comment.setUserId(userId);
            comment.setContent(content);
            comment.setCreatedAt(new Date());

            if (post.getComments() == null) {
                post.setComments(new ArrayList<>());
            }
            post.getComments().add(comment);

            return postRepository.save(post);
        });
    }

    public Optional<Post> updateComment(String postId, String commentId, String userId, String content) {
        return postRepository.findById(postId).map(post -> {
            if (post.getComments() != null) {
                for (Comment comment : post.getComments()) {
                    if (comment.getId().equals(commentId) && comment.getUserId().equals(userId)) {
                        comment.setContent(content);
                        comment.setUpdatedAt(new Date());
                        break;
                    }
                }
            }
            return postRepository.save(post);
        });
    }

    public Optional<Post> deleteComment(String postId, String commentId, String userId) {
        return postRepository.findById(postId).map(post -> {
            if (post.getComments() != null) {
                post.setComments(post.getComments().stream()
                        .filter(comment -> !(comment.getId().equals(commentId) && comment.getUserId().equals(userId)))
                        .toList());
            }
            return postRepository.save(post);
        });
    }
}