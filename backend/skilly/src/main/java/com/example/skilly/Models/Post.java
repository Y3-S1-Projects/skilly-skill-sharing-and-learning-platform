package com.example.skilly.Models;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private String postType;
    private String title;
    private String content;
    private List<String> mediaUrls;
    private List<String> likes;
    private List<String> sharedBy;
    private List<Comment> comments = new ArrayList<>();
    private Date createdAt = new Date();
}