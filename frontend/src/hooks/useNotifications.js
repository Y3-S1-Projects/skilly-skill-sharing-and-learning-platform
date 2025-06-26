import React from "react";
import { NotificationContext } from "../Components/CustomNotification/NotificationProvider";
export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};
