import React, { useState } from "react";
import NotificationItem from "./NotificationItem";

const NotificationContainer = ({
  notifications,
  onRemove,
  position = "top-right",
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const getExpandDirection = () => {
    return position.includes("bottom") ? "up" : "down";
  };

  return (
    <div
      className={`${getContainerPosition()} z-50`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: isHovered
          ? `${Math.max(notifications.length * 70, 80)}px`
          : "80px",
        width: "320px",
      }}
    >
      <div className="relative">
        {notifications.slice(0, 3).map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
            index={index}
            isStackHovered={isHovered}
            position={position}
            expandDirection={getExpandDirection()}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
