package com.example.skilly.Models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users") 
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String profilePicUrl;
    private String bio;
    private String profilePic;
    private String role;
    private List<String> following;
    private List<String> followers;
    private List<String> skills;

    private LocalDateTime registrationDate;
    private LocalTime lastOnline;
    
    

    @Override
    public String toString() {
        return "User{" +
            "id='" + id + '\'' +
            ", username='" + username + '\'' +
            ", email='" + email + '\'' +
            ", profilePic='" + profilePic + '\'' +
            ", following=" + following +
            '}';
}
}


