package com.example.skilly.Services;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

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

    public double calculateTrendingScore(Post post) {
        // First, check if the post is older than 30 days (exclude entirely)
        long now = System.currentTimeMillis();
        long postAgeMillis = now - post.getCreatedAt().getTime();
        double ageInDays = postAgeMillis / (1000.0 * 60 * 60 * 24.0);

        // Skip posts older than 30 days entirely
        if (ageInDays > 30) {
            return 0; // Return 0 instead of -1 to exclude from trending
        }

        int likesCount = post.getLikes() != null ? post.getLikes().size() : 0;
        int savesCount = post.getSavedBy() != null ? post.getSavedBy().size() : 0;
        int commentsCount = post.getComments() != null ? post.getComments().size() : 0;
        int totalEngagement = likesCount + savesCount + commentsCount;

        // Minimum engagement requirement: At least 2 interactions
        if (totalEngagement < 2) {
            return 0;
        }

        // Weights (saves & comments matter more than likes)
        double w1 = 1.0;  // likes
        double w2 = 2.5;  // saves (stronger signal)
        double w3 = 2.0;  // comments

        // Engagement score (weighted sum)
        double engagementScore = (w1 * likesCount) + (w2 * savesCount) + (w3 * commentsCount);

        // Recency boost (capped at 20 and scales with engagement)
        double recencyBoost = 20.0 * (1 - ageInDays / 30.0) * Math.log1p(totalEngagement);

        return engagementScore + recencyBoost;
    }

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

    public List<Post> getSavedPostsByUser(String userId) {
        return postRepository.findBySavedByContaining(userId);
    }

    public List<Post> getTrendingPosts() {
        long now = System.currentTimeMillis();

        return postRepository.findAll().stream()
                // 1️⃣ FILTER posts older than 30 days
                .filter(post -> {
                    long ageMillis = now - post.getCreatedAt().getTime();
                    double ageInDays = ageMillis / (1000.0 * 60 * 60 * 24.0);
                    return ageInDays <= 30;
                })
                // 2️⃣ FILTER posts with very low engagement (optional, your choice)
                .filter(post -> {
                    int totalEngagement = (post.getLikes() != null ? post.getLikes().size() : 0)
                            + (post.getSavedBy() != null ? post.getSavedBy().size() : 0)
                            + (post.getComments() != null ? post.getComments().size() : 0);
                    return totalEngagement >= 2;
                })
                // 3️⃣ SORT by score
                .sorted((p1, p2) -> Double.compare(
                        calculateTrendingScore(p2),
                        calculateTrendingScore(p1)
                ))
                .collect(Collectors.toList());
    }

    public List<Post> getRecentPosts() {
        // Calculate the cutoff date 30 days ago
        long thirtyDaysMillis = 30L * 24 * 60 * 60 * 1000;
        Date cutoffDate = new Date(System.currentTimeMillis() - thirtyDaysMillis);

        // Use the repository query
        return postRepository.findByCreatedAtAfter(cutoffDate)
                .stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public List<Post> getPopularPosts() {
        // 30 days ago
        long thirtyDaysMillis = 30L * 24 * 60 * 60 * 1000;
        Date cutoffDate = new Date(System.currentTimeMillis() - thirtyDaysMillis);

        // Get posts within last 30 days
        return postRepository.findByCreatedAtAfter(cutoffDate)
                .stream()
                // Calculate total likes + comments
                .sorted((p1, p2) -> {
                    int p1Score = (p1.getLikes() != null ? p1.getLikes().size() : 0)
                            + (p1.getComments() != null ? p1.getComments().size() : 0);

                    int p2Score = (p2.getLikes() != null ? p2.getLikes().size() : 0)
                            + (p2.getComments() != null ? p2.getComments().size() : 0);

                    return Integer.compare(p2Score, p1Score);
                })
                .collect(Collectors.toList());
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