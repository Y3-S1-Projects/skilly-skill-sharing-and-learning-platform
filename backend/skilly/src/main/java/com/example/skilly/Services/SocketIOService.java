package com.example.skilly.Services;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.skilly.DTOs.LikeNotification;
import com.example.skilly.Models.Notification;
import com.example.skilly.Models.User;
import com.example.skilly.Repositories.NotificationRepository;
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
        System.out.println("Socket.IO server started on port 8081");

    }

    private void startServer() {
        server.addConnectListener(client -> {
            System.out.println("Client connected: " + client.getSessionId());
        });

        server.addEventListener("join", String.class, (client, userId, ackRequest) -> {
            client.joinRoom(userId);
            System.out.println("User " + userId + " joined room: " + userId);

            // Send unread notifications if available
            List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
            long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(userId);

            if (unreadCount > 0) {
                client.sendEvent("notifications_unread_count", unreadCount);
                client.sendEvent("notifications_initial", unreadNotifications);
            }

            // Send ack
            if (ackRequest.isAckRequested()) {
                ackRequest.sendAckData("Joined room successfully");
            }
        });

        server.addDisconnectListener(client -> {
            System.out.println("Client disconnected: " + client.getSessionId());
        });

        server.start();
        System.out.println("Socket.IO server started on port 8081");
    }

    public void processLikeNotification(String receiverId, LikeNotification likeData) {
        try {
            String senderId = likeData.getSenderId();
            String postId = likeData.getPostId();
            String action = likeData.getAction();

            User sender = userRepository.findById(senderId).orElse(null);
            String senderName = (sender != null) ? sender.getUsername() : "Someone";

            System.out.println("Socket service processing notification: " + receiverId);
            System.out.println("Room operations for " + receiverId + ": " + server.getRoomOperations(receiverId));
            System.out.println("Connected clients in room: " + server.getRoomOperations(receiverId).getClients().size());

            if ("LIKE".equals(action)) {
                Notification notification = new Notification();
                notification.setUserId(receiverId);
                notification.setSenderId(senderId);
                notification.setPostId(postId);
                notification.setCreatedAt(LocalDateTime.now());
                notification.setType("POST_LIKE");
                notification.setMessage(senderName + " liked your post");
                notification.setRead(false);

                notification = notificationRepository.save(notification);

                server.getRoomOperations(receiverId).sendEvent("notification", notification);

                long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(receiverId);
                server.getRoomOperations(receiverId).sendEvent("notifications_unread_count", unreadCount);
            }
            else if ("UNLIKE".equals(action)) {
                List<Notification> existingNotifications = notificationRepository
                        .findByUserIdAndSenderIdAndPostIdAndType(receiverId, senderId, postId, "POST_LIKE");

                if (!existingNotifications.isEmpty()) {
                    notificationRepository.deleteAll(existingNotifications);

                    existingNotifications.forEach(notification -> {
                        server.getRoomOperations(receiverId).sendEvent("notification_remove", notification.getId());
                    });

                    long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(receiverId);
                    server.getRoomOperations(receiverId).sendEvent("notifications_unread_count", unreadCount);
                }
            }
        } catch (Exception e) {
            System.err.println("Error processing like notification: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

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
        System.out.println("Socket.IO server stopped");
    }
}