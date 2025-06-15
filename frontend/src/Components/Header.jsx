import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationSystem from "./NotificationSystem";
import UserSidebar from "./Headers/UserSidebar";
import { ArrowRight } from "lucide-react";

const Header = ({ onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(
          "http://localhost:8080/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;

        setCurrentUser({
          id: data.id,
          name: data.username,
          title: data.role === "ADMIN" ? "Administrator" : "Beginner",
          avatar:
            data.profilePicUrl || data.profilePic || "/api/placeholder/120/120",
          coverPhoto: "/api/placeholder/1200/300",
          bio: data.bio || "",
          location: "",
          joinDate: new Date(data.registrationDate).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          stats: {
            followers: data.followers?.length || 0,
            following: data.following?.length || 0,
            skillsLearned: data.skills?.length || 0,
            skillsInProgress: 0,
            achievements: 0,
          },
          skills:
            data.skills?.map((skill) => ({
              name: skill,
              level: "Beginner",
              endorsements: Math.floor(Math.random() * 40),
            })) || [],
          learningGoals: [],
          certifications: [],
          // Keep raw API data accessible if needed
          rawData: data,
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper functions
  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    return initials;
  };

  const getColorClass = (userId) => {
    const colors = [
      "bg-blue-200 text-blue-600",
      "bg-green-200 text-green-600",
      "bg-purple-200 text-purple-600",
      "bg-pink-200 text-pink-600",
      "bg-yellow-200 text-yellow-600",
      "bg-indigo-200 text-indigo-600",
    ];
    const index = userId
      ? parseInt(userId.toString().charAt(0), 10) % colors.length
      : 0;
    return colors[index];
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      // Redirect to search results page with the query parameter
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem("authToken");
    // Redirect to login page
    window.location.href = "/";
    // Close sidebar
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="bg-gray-600 text-white sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo and navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/skilly-new.png"
                  alt="Skilly"
                  width={60}
                  height={60}
                />
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {[
                  { href: "/socialfeed", name: "Home", current: true },
                  { href: "#", name: "Explore", current: false },
                  { href: "#", name: "Learn", current: false },
                  { href: "#", name: "Community", current: false },
                ].map((item, index) => (
                  <a
                    key={index}
                    href={`${item.href}`}
                    className="relative overflow-hidden inline-block group"
                  >
                    <span className="block text-gray-200 text-2xl transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                      {item.name}
                    </span>
                    <span className="absolute top-full left-0 w-full text-black text-2xl font-medium transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                      {item.name}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Search bar */}
            <div className="hidden sm:flex items-center flex-1 max-w-xs ml-6">
              <div className="w-full">
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all duration-200"
                    placeholder="Search skills, people..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                  />
                </div>
              </div>
            </div>

            {/* Right side - user menu and notifications */}
            <div className="flex items-center space-x-4">
              {/* Notification System Integration */}
              <div className="relative" ref={notificationsRef}>
                {currentUser && (
                  <NotificationSystem
                    currentUser={currentUser}
                    className="hover:scale-110 transition-transform duration-200"
                  />
                )}
              </div>

              {/* Messages button */}
              <button className="p-1 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200 transform hover:scale-110">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>

              {/* Profile menu button */}
              <button
                type="button"
                className="bg-gray-900 rounded-full flex items-center focus:outline-none transition-all duration-200 hover:ring-2 hover:ring-gray-400 cursor-pointer"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Open user menu</span>
                {currentUser?.avatar &&
                !currentUser.avatar.includes("/api/placeholder/") ? (
                  <img
                    className="h-8 w-8 rounded-full transition-transform duration-200 "
                    src={currentUser.avatar}
                    alt={currentUser?.name || "User"}
                  />
                ) : (
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 ${getColorClass(
                      currentUser?.id
                    )}`}
                  >
                    {getInitials(currentUser?.name)}
                  </div>
                )}
                {/* {currentUser?.name && (
                  <span className="ml-2 text-sm font-medium text-white hidden md:block">
                    {currentUser.name}
                  </span>
                )} */}
                <svg
                  className={`ml-1 h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    isSidebarOpen ? "rotate-90" : "-rotate-90"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* User Sidebar */}
      <UserSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        currentUser={currentUser}
        onLogout={handleLogout}
        getInitials={getInitials}
        getColorClass={getColorClass}
      />
    </>
  );
};

export default Header;
