import React, { useEffect, useState, useRef } from "react";
import {
  connectWebSocket,
  disconnectWebSocket,
  isConnected,
} from "../services/webSocketService";
import { toast } from "react-toastify"; // Or your preferred notification library
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function NotificationSystem({ currentUser }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketConnectionRef = useRef(null);

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const dropdownContent = dropdownRef.current.querySelector(".max-h-96");
      if (dropdownContent) {
        dropdownContent.scrollTop = 0;
      }
    }
  }, [notifications, showDropdown]);

  useEffect(() => {
    if (!currentUser) return;

    // Connect to WebSocket when component mounts or user changes
    socketConnectionRef.current = connectWebSocket(currentUser.id, {
      onNotification: handleNewNotification,
      onNotificationRemove: handleRemoveNotification,
      onUnreadCount: handleUnreadCount,
    });

    // Fetch existing notifications
    fetchNotifications();

    // Set up periodic connection check
    const intervalId = setInterval(() => {
      if (!isConnected()) {
        socketConnectionRef.current = connectWebSocket(currentUser.id, {
          onNotification: handleNewNotification,
          onNotificationRemove: handleRemoveNotification,
          onUnreadCount: handleUnreadCount,
        });
      }
    }, 10000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      disconnectWebSocket();
    };
  }, [currentUser?.id]);

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (showDropdown && currentUser) {
      fetchNotifications();
    }
  }, [showDropdown]);

  const fetchNotifications = async () => {
    if (!currentUser) return;

    // Set loading state at the beginning of the fetch process
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      // Fetch notifications
      const notificationsResponse = await axios.get(
        `http://localhost:8080/api/notifications/${currentUser.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Get notifications sorted by createdAt
      const sortedNotifications = notificationsResponse.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Enrich notifications with sender details
      const enrichedNotifications = await Promise.all(
        sortedNotifications.map(async (notification) => {
          try {
            if (notification.senderId) {
              const userResponse = await axios.get(
                `http://localhost:8080/api/users/${notification.senderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              // Add sender details to notification object
              return {
                ...notification,
                senderAvatar: userResponse.data.profilePicUrl || null,
                senderName:
                  userResponse.data.username ||
                  userResponse.data.name ||
                  "User",
              };
            }
            return notification;
          } catch (error) {
            console.error(
              `Failed to fetch sender details for notification ${notification.id}:`,
              error
            );
            return notification;
          }
        })
      );

      setNotifications(enrichedNotifications);

      // Calculate unread count based on isRead status
      const unread = enrichedNotifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      // Set loading to false only after all processing is complete
      setIsLoading(false);
    }
  };

  const handleNewNotification = async (notification) => {
    try {
      // Fetch sender details if senderId exists
      if (notification.senderId) {
        const token = localStorage.getItem("authToken");
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${notification.senderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        notification = {
          ...notification,
          senderAvatar: userResponse.data.profilePicUrl || null,
          senderName:
            userResponse.data.username || userResponse.data.name || "User",
        };
      }

      // Update notifications state in a way that forces the dropdown to show the new notification
      setNotifications((prev) => {
        // Check for duplicates
        if (prev.some((n) => n.id === notification.id)) return prev;

        // Add new notification at the top
        return [notification, ...prev];
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast
      toast.info(notification.message, {
        onClick: () => {
          if (notification.postId) {
            navigate(`/posts/${notification.postId}`);
          }
        },
      });
    } catch (error) {
      console.error("Failed to fetch sender details:", error);
      // Still add the notification without sender details
      setNotifications((prev) => {
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Handler for removing notifications
  const handleRemoveNotification = (notificationId) => {
    // Remove from notifications list
    setNotifications((prev) => {
      const updatedNotifications = prev.filter((n) => n.id !== notificationId);
      return updatedNotifications;
    });

    // Update unread count if needed
    const removedNotification = notifications.find(
      (n) => n.id === notificationId
    );
    if (removedNotification && !removedNotification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleUnreadCount = (count) => {
    setUnreadCount(count);
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8080/api/notifications/${currentUser.id}/mark-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(0);
      // Update the read status in the notifications list
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update the UI
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Rollback UI changes if the backend update fails
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.isHandling) return;

    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isHandling: true } : n
        )
      );

      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Use navigate instead of window.location
      if (notification.postId) {
        navigate(`/posts/${notification.postId}`);
      } else if (notification.profileId) {
        navigate(`/profile/${notification.profileId}`);
      }
    } finally {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isHandling: false } : n
        )
      );
      setShowDropdown(false);
    }
  };

  // Format relative time
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Toggle dropdown and fetch notifications when opened
  const toggleDropdown = () => {
    const newState = !showDropdown;
    setShowDropdown(newState);
    if (newState) {
      fetchNotifications();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="notification-system relative">
      <button
        className="relative p-1 text-gray-400 hover:text-black focus:text-black focus:outline-none transition-colors duration-200"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="origin-top-right absolute right-0 mt-2 w-80  shadow-lg bg-white border border-black focus:outline-none z-10 overflow-hidden"
        >
          <div className="flex justify-between items-center px-4 py-2 bg-gray-400 border-b border-gray-700">
            <h3 className="text-sm font-medium text-black">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-black hover:text-gray-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 px-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="text-black text-sm mt-2">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-4 px-4 text-center text-black text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-black cursor-pointer  hover:bg-gray-300 transition-colors ${
                    !notification.read ? "bg-indigo-900/30" : ""
                  }`}
                >
                  <div className="flex items-start">
                    {notification.senderAvatar ? (
                      <img
                        src={notification.senderAvatar}
                        alt=""
                        className="h-8 w-8 rounded-full mr-3 border border-gray-600"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-900/50 flex items-center justify-center mr-3 border border-gray-600">
                        <span className="text-xs font-medium text-black">
                          {notification.senderName?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="ml-2 h-2 w-2 rounded-full bg-indigo-400"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="px-4 py-2 text-center border-t bg-gray-400 border-gray-700">
              <Link
                to="/notifications"
                className="text-sm text-black hover:text-gray-700 transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationSystem;
