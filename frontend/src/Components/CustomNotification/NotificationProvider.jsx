import React, { useState, useEffect } from "react";
import NotificationContainer from "./NotificationContainer";

export const NotificationContext = React.createContext();

const NotificationProvider = ({ children, position = "top-right" }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now(),
    };

    setNotifications((prev) => {
      // Check if similar notification exists (same title and type)
      const existingIndex = prev.findIndex(
        (n) => n.title === notification.title && n.type === notification.type
      );

      if (existingIndex !== -1) {
        // Stack similar notifications (max 3)
        const existing = prev[existingIndex];
        const updatedNotification = {
          ...existing,
          count: Math.min((existing.count || 1) + 1, 3),
          timestamp: Date.now(),
          id: existing.id, // Keep original ID to maintain dismiss timer
        };

        const updated = [...prev];
        updated[existingIndex] = updatedNotification;
        return updated;
      } else {
        // Add new notification
        return [newNotification, ...prev].slice(0, 5); // Keep max 5 notifications
      }
    });
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
        position={position}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
