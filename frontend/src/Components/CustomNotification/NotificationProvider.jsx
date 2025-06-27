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
      // Add new notification at the beginning and keep max 3 (FIFO)
      const updated = [newNotification, ...prev];
      return updated.slice(0, 3);
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
