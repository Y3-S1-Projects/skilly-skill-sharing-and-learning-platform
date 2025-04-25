package com.example.skilly.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LikeNotification {
    private String postId;
    private String senderId;
    private String action;

}
