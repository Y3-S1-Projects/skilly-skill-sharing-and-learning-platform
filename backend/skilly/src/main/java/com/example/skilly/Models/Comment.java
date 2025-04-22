package com.example.skilly.Models;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private String id;
    private String userId;
    private String content;
    private Date createdAt = new Date();
    private Date updatedAt;
}