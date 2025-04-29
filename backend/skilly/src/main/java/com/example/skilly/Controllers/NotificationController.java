package com.example.skilly.Controllers;

import com.example.skilly.DTOs.CommentNotification;
import com.example.skilly.DTOs.LikeNotification;
import com.example.skilly.Models.Notification;
import com.example.skilly.Services.SocketIOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final SocketIOService socketIOService;

    @Autowired
    public NotificationController(SocketIOService socketIOService) {
        this.socketIOService = socketIOService;
    }

    public void sendNotificationToUser(String userId, LikeNotification notification) {
        socketIOService.processLikeNotification(userId, notification);
    }

    public void sendCommentNotificationToUser(String userId, CommentNotification notification) {
        socketIOService.processCommentNotification(userId, notification);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(socketIOService.getUserNotifications(userId));
    }

    @PutMapping("/{userId}/mark-read")
    public ResponseEntity<List<Notification>> markNotificationsAsRead(@PathVariable String userId) {
        return ResponseEntity.ok(socketIOService.markAsRead(userId));
    }
}