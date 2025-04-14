package com.example.skilly.Repositories;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.skilly.Models.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String username);

}