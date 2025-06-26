import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationItem from "./NotificationItem";

const NotificationContainer = ({
  notifications,
  onRemove,
  position = "top-right",
}) => {
  const getContainerPosition = () => {
    const positions = {
      "top-right": "fixed top-4 right-4",
      "top-left": "fixed top-4 left-4",
      "top-center": "fixed top-4 left-1/2 transform -translate-x-1/2",
      "bottom-right": "fixed bottom-4 right-4",
      "bottom-left": "fixed bottom-4 left-4",
      "bottom-center": "fixed bottom-4 left-1/2 transform -translate-x-1/2",
    };
    return positions[position] || positions["top-right"];
  };

  const getFlexDirection = () => {
    return position.includes("bottom") ? "flex-col-reverse" : "flex-col";
  };

  return (
    <div
      className={`${getContainerPosition()} z-50 flex ${getFlexDirection()} space-y-2`}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
