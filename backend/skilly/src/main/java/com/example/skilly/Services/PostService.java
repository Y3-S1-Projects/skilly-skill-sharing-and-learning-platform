package com.example.skilly.Services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.skilly.Models.Post;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.PostRepository;
import com.example.skilly.Repositories.UserRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public Post sharePost(String userId, String postId) {
        Optional<Post> postOptional = postRepository.findById(postId);
        Optional<User> userOptional = userRepository.findById(userId);

        if (postOptional.isPresent() && userOptional.isPresent()) {
            Post post = postOptional.get();
            return post;
        }
        throw new RuntimeException("Post or User not found");
    }
}
