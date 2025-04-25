package com.example.skilly.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    private String userId;      // User who receives the notification
    private String senderId;    // User who triggered the notification
    private String postId;      // Related post ID
    private String type;        // Notification type (like, comment, etc.)
    private String message;     // Human-readable message
    private boolean isRead;     // Read status

    @CreatedDate
    private LocalDateTime createdAt;
}