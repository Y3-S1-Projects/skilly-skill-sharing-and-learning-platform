package com.example.skilly.Models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

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
    private String profilePic;
    private List<String> following;

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


