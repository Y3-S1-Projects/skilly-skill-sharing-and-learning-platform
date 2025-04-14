package com.example.skilly.Controllers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.skilly.Exceptions.ResourceNotFoundException;
import com.example.skilly.Models.Post;
import com.example.skilly.Models.User;
import com.example.skilly.Services.SearchService;
import com.example.skilly.Services.UserService;

@RestController
@RequestMapping("/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(searchService.searchUsers(keyword));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> searchPosts(@RequestParam String keyword) {
        List<Post> posts = searchService.searchPosts(keyword);
        List<Map<String, Object>> postsWithUserInfo = new ArrayList<>();

        for (Post post : posts) {
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("post", post);

            try {
                // Get the user who created the post using your existing UserService
                User user = userService.getUserById(post.getUserId());
                postMap.put("username", user.getUsername());
                postMap.put("avatar", user.getProfilePicUrl());

            } catch (ResourceNotFoundException e) {
                // Handle case where user doesn't exist
                postMap.put("username", "Unknown User");
            }

            postsWithUserInfo.add(postMap);
        }

        return ResponseEntity.ok(postsWithUserInfo);
    }
}
