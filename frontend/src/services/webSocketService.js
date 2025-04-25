// src/services/socketService.js
import { io } from "socket.io-client";

let socket = null;
let notificationCallback = null;
let notificationRemoveCallback = null;
let unreadCountCallback = null;

export const connectWebSocket = (userId, options = {}) => {
  // Disconnect any existing connections
  if (socket && socket.connected) {
    socket.disconnect();
  }

  // Set callbacks
  notificationCallback = options.onNotification || null;
  notificationRemoveCallback = options.onNotificationRemove || null;
  unreadCountCallback = options.onUnreadCount || null;

  // Connect to Socket.IO server
  socket = io("http://localhost:8081", {
    path: "/socket.io",
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection handlers
  socket.on("connect", () => {
    console.log("Connected to WebSocket with ID:", socket.id);

    // Join a room for this user
    socket.emit("join", userId, (response) => {
      console.log("Join response:", response);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
  });

  // Notification handlers
  socket.on("notification", (notification) => {
    console.log("Received notification:", notification);
    if (notificationCallback) notificationCallback(notification);
  });

  // New handler for removing notifications (on unlike)
  socket.on("notification_remove", (notificationId) => {
    console.log("Remove notification:", notificationId);
    if (notificationRemoveCallback) notificationRemoveCallback(notificationId);
  });

  socket.on("notifications_unread_count", (count) => {
    console.log("Unread notifications:", count);
    if (unreadCountCallback) unreadCountCallback(count);
  });

  socket.on("notifications_initial", (notifications) => {
    console.log("Initial notifications:", notifications);
    if (notificationCallback && Array.isArray(notifications)) {
      notifications.forEach((n) => notificationCallback(n));
    }
  });

  return socket;
};

// Other methods remain the same
export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isConnected = () => {
  return socket && socket.connected;
};

export const getSocket = () => socket;
