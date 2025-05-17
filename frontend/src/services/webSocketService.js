// src/services/socketService.js
import { io } from "socket.io-client";

let socket = null;
let notificationCallback = null;
let notificationRemoveCallback = null;
let unreadCountCallback = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

export const connectWebSocket = (userId, options = {}) => {
  // Disconnect any existing connections
  if (socket && socket.connected) {
    console.log("Disconnecting existing socket connection");
    socket.disconnect();
  }

  // Set callbacks
  notificationCallback = options.onNotification || null;
  notificationRemoveCallback = options.onNotificationRemove || null;
  unreadCountCallback = options.onUnreadCount || null;

  console.log("Attempting to connect to WebSocket server...");

  // Connect to Socket.IO server
  socket = io("http://localhost:8081", {
    // Don't include path unless your server has a custom path
    // path: "/socket.io",

    // Try polling first, then upgrade to websocket if possible
    transports: ["polling", "websocket"],

    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    timeout: 20000, // Increased timeout to match server
    autoConnect: true,
    forceNew: true, // Force a new connection

    // Explicitly set to match server settings
    upgrade: true,
    rememberUpgrade: true,

    // For debugging
    query: { userId: userId },
  });

  // Connection handlers
  socket.on("connect", () => {
    console.log("Connected to WebSocket with ID:", socket.id);
    reconnectAttempts = 0;

    // Join a room for this user
    socket.emit("join", userId, (response) => {
      console.log("Join response:", response);
    });
  });

  socket.io.on("reconnect_attempt", (attempt) => {
    console.log(`Socket.IO reconnection attempt #${attempt}`);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);

    // For specific errors that don't trigger reconnect automatically
    if (reason === "io server disconnect") {
      // Server disconnected us, try to reconnect manually
      socket.connect();
    }
  });

  socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached. Giving up.");
      socket.disconnect();
    } else {
      console.log(
        `Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
      );
    }
  });

  // Notification handlers
  socket.on("notification", (notification) => {
    console.log("Received notification:", notification);
    if (notificationCallback) notificationCallback(notification);
  });

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

export const disconnectWebSocket = () => {
  if (socket) {
    console.log("Manually disconnecting websocket");
    socket.disconnect();
    socket = null;
  }
};

export const isConnected = () => {
  return socket && socket.connected;
};

export const getSocket = () => socket;

// Improved server status check
export const checkServerStatus = () => {
  return new Promise((resolve, reject) => {
    // Use polling first for more reliable initial connection
    const tempSocket = io("http://localhost:8081", {
      transports: ["polling"],
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
    });

    const timeout = setTimeout(() => {
      tempSocket.disconnect();
      reject(new Error("Connection timeout"));
    }, 10000);

    tempSocket.on("connect", () => {
      clearTimeout(timeout);
      tempSocket.disconnect();
      resolve(true);
    });

    tempSocket.on("connect_error", (err) => {
      clearTimeout(timeout);
      tempSocket.disconnect();
      reject(err);
    });
  });
};
