package com.example.skilly.Repositories;

import java.util.Date;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.skilly.Models.Post;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);

    List<Post> findByTitleContainingIgnoreCase(String title);

    List<Post> findAllByOrderByCreatedAtDesc();

    List<Post> findBySavedByContaining(String userId);

    List<Post> findByCreatedAtAfter(Date date);

}
