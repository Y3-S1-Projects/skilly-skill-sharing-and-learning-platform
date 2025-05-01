package com.example.skilly.Repositories;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.skilly.Models.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByUsernameContainingIgnoreCase(String username);

    @Query(value = "{ 'following': ?0 }")
    Page<User> findFollowersByUserId(String userId, Pageable pageable);

    @Query(value = "{ 'following': ?0, $or: [ { 'username': { $regex: ?1, $options: 'i' } }, { 'name': { $regex: ?1, $options: 'i' } } ] }")
    Page<User> findFollowersByUserIdAndSearchQuery(String userId, String searchQuery, Pageable pageable);

    @Query(value = "{ '_id': { $in: ?0 } }")
    Page<User> findFollowingByUserIds(List<String> followingIds, Pageable pageable);

    @Query(value = "{ '_id': { $in: ?0 }, $or: [ { 'username': { $regex: ?1, $options: 'i' } }, { 'name': { $regex: ?1, $options: 'i' } } ] }")
    Page<User> findFollowingByUserIdsAndSearchQuery(List<String> followingIds, String searchQuery, Pageable pageable);
}