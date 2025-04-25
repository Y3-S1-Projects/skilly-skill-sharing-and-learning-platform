package com.example.skilly.Services;

import com.example.skilly.DTOs.LikeNotification;
import com.example.skilly.Models.Notification;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.NotificationRepository;
import com.corundumstudio.socketio.SocketIOServer;
import com.example.skilly.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SocketIOService {

    private final SocketIOServer server;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;


    @Autowired
    public SocketIOService(SocketIOServer server, NotificationRepository notificationRepository, UserRepository userRepository) {
        this.server = server;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        startServer();
    }


    private void startServer() {
        // Same server setup code as before
        server.addConnectListener(client -> {
            System.out.println("Client connected: " + client.getSessionId());
        });

        server.addDisconnectListener(client -> {
            System.out.println("Client disconnected: " + client.getSessionId());
        });

        server.addEventListener("join", String.class, (client, userId, ackSender) -> {
            client.joinRoom(userId);
            System.out.println("User " + userId + " joined room: " + userId);

            // Send unread notifications if available
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

            if (unreadCount > 0) {
                client.sendEvent("notifications_unread_count", unreadCount);
                client.sendEvent("notifications_initial", unreadNotifications);
            }

            ackSender.sendAckData("Joined room successfully");
        });

        server.start();
        System.out.println("SocketIO server started on port 8081");
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void processLikeNotification(String receiverId, LikeNotification likeData) {
        try {
            String senderId = likeData.getSenderId();
            String postId = likeData.getPostId();
            String action = likeData.getAction();

            // Get username of sender for personalized notification
            User sender = userRepository.findById(senderId).orElse(null);
            String senderName = (sender != null) ? sender.getUsername() : "Someone";

            if ("LIKE".equals(action)) {
                // Create a new notification for like
                Notification notification = new Notification();
                notification.setUserId(receiverId);
                notification.setSenderId(senderId);
                notification.setPostId(postId);
                notification.setCreatedAt(LocalDateTime.now());
                notification.setType("POST_LIKE");
                notification.setMessage(senderName + " liked your post");
                notification.setRead(false);

                // Save notification to MongoDB
                notification = notificationRepository.save(notification);

                // Send real-time notification via socket.io
                server.getRoomOperations(receiverId).sendEvent("notification", notification);

                // Update unread count
                long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(receiverId);
                server.getRoomOperations(receiverId).sendEvent("notifications_unread_count", unreadCount);
            }
            else if ("UNLIKE".equals(action)) {
                // Find and delete like notification instead of creating unlike notification
                List<Notification> existingNotifications = notificationRepository
                        .findByUserIdAndSenderIdAndPostIdAndType(receiverId, senderId, postId, "POST_LIKE");

                if (!existingNotifications.isEmpty()) {
                    notificationRepository.deleteAll(existingNotifications);

                    // Notify client to remove the notification from UI
                    existingNotifications.forEach(notification -> {
                        server.getRoomOperations(receiverId).sendEvent("notification_remove", notification.getId());
                    });

                    // Update unread count
                    long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(receiverId);
                    server.getRoomOperations(receiverId).sendEvent("notifications_unread_count", unreadCount);
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing like notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Other methods remain the same
    public List<Notification> markAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        List<Notification> savedNotifications = notificationRepository.saveAll(unreadNotifications);

        server.getRoomOperations(userId).sendEvent("notifications_unread_count", 0);

        return savedNotifications;
    }

    @PreDestroy
    private void stopServer() {
        server.stop();
        System.out.println("SocketIO server stopped");
    }
}