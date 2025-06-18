import AnimatedButton from "@/components/custom/AnimatedButton";
import React from "react";

const UserSidebar = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  getInitials,
  getColorClass,
}) => {
  const handleLogout = () => {
    // Clear auth token
    localStorage.removeItem("authToken");
    // Redirect to login page
    window.location.href = "/";
    // Close sidebar
    onClose();
  };

  const menuItems = [
    {
      label: "Profile",
      href: "/userprofile",
      description: "View and edit your profile",
    },
    {
      label: "Learning Plans",
      href: "/learning-plans",
      description: "Track your learning progress",
    },
    {
      label: "Settings",
      href: "/settings",
      description: "Manage your preferences",
    },
    {
      label: "Logout",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      {/* <div
        className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      > */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-black shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 ">
          <div className="flex items-center justify-start">
            <button
              onClick={onClose}
              className="p-2 transition-all duration-200 hover:bg-gray-300 focus:outline-none"
              aria-label="Close sidebar"
            >
              <svg
                className="h-6 w-6 text-gray-400 hover:text-white transform rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            {currentUser?.avatar &&
            !currentUser.avatar.includes("/api/placeholder/") ? (
              <img
                className="w-16 h-16 rounded-full ring-2 ring-gray-500"
                src={currentUser.avatar}
                alt={currentUser?.name || "User"}
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ring-gray-500 ${getColorClass(
                  currentUser?.id
                )}`}
              >
                {getInitials(currentUser?.name)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-black truncate">
                {currentUser?.name || "Guest"}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {currentUser?.bio}
              </p>
              <div className="flex items-center mt-2 text-xs text-gray-400">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m0 0H8m8 0a1 1 0 011 1v8a1 1 0 01-1 1H8a1 1 0 01-1-1V8a1 1 0 011-1z"
                  />
                </svg>
                Member since {currentUser?.joinDate || "Recently"}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {/* <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">
                {currentUser?.stats?.skillsLearned || 0}
              </div>
              <div className="text-xs text-gray-400">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {currentUser?.stats?.followers || 0}
              </div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {currentUser?.stats?.following || 0}
              </div>
              <div className="text-xs text-gray-400">Following</div>
            </div>
          </div> */}
        </div>

        {/* Menu Items */}
        <div className="p-6 space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`text-black  cursor-pointer transition-all duration-200 group  ${
                item.label === "Logout"
                  ? "hover:text-red-500"
                  : "hover:text-gray-500"
              }`}
            >
              <div className="">
                <div
                  className="text-4xl font-semibold my-8"
                  {...(item.label === "Logout" && {
                    onClick: handleLogout,
                  })}
                >
                  {item.label}{" "}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Logout Button */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
          <AnimatedButton label="Sign Out" onClick={handleLogout}>
            {" "}
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </AnimatedButton>
        </div> */}
      </div>
    </>
  );
};

export default UserSidebar;
