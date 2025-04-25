package com.example.skilly.Repositories;

import com.example.skilly.Models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    long countByUserIdAndIsReadFalse(String userId);
    List<Notification> findByUserIdAndSenderIdAndPostIdAndType(String userId,
                                                               String senderId,
                                                               String postId,
                                                               String type);
}