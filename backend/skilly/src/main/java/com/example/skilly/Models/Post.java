package com.example.skilly.Models;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.example.skilly.Models.PostType;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")

public class Post {
    @Id
    private String id;
    private String userId;
    private String username;
    private PostType postType;
    private String title;
    private String content;
    private List<String> mediaUrls;
    private List<String> likes;
    private List<String> sharedBy;
    private List<String> savedBy = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();
    private Date createdAt = new Date();
    private String originalPostId;
    private String originalUserId;
    private String originalUsername;
    private List<String> mediaPublicIds; // To store Cloudinary public IDs for media
    private String videoUrl; // To store video URL
    private String videoPublicId; // To store video public ID
    private Integer videoDuration; // To store video duration in seconds

}