package com.example.skilly.DTOs;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CommentNotification {
    private String postId;
    private String senderId;
    private String commentContent;
}