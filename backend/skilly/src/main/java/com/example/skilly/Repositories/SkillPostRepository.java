package com.example.skilly.Repositories;

import com.example.skilly.Models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SkillPostRepository extends MongoRepository<Post, String> {
    List<Post> findByUserId(String userId);
}
