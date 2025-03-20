package com.example.skilly.Controllers;

import com.example.skilly.Models.User;
import com.example.skilly.Services.UserService;
import com.example.skilly.Utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        System.out.println("Creating user: " + user);
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/id")
    public String getUserId(@RequestHeader("Authorization") String token) {
        // Remove "Bearer " prefix from the token
        String jwtToken = token.substring(7);
        return jwtUtil.getUserIdFromToken(jwtToken);
    }

    @GetMapping("/role")
    public String getUserRole(@RequestHeader("Authorization") String token) {
        // Remove "Bearer " prefix from the token
        String jwtToken = token.substring(7);
        return jwtUtil.getUserRoleFromToken(jwtToken);
    }
}