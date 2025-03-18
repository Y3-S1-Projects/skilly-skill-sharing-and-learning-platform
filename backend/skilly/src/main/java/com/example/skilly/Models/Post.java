package com.example.skilly.Models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId; 
    private String content;
    private List<String> mediaUrls; 
    private List<String> likes;
    private List<String> sharedBy;
    private Date createdAt = new Date();
}
