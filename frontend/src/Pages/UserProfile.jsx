import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import CreatePostModal from "../Components/Modals/CreatePost";

const UserProfile = () => {
  // This would come from API/context in a real app
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [user, setUser] = useState({
    id: "",
    name: "",
    title: "", // Optional: could be generated from role or left blank
    avatar: "", // From user.profilePicUrl or user.profilePic
    coverPhoto: "/api/placeholder/1200/300", // Static or separate API
    bio: "",
    location: "", // If you add this in backend later
    joinDate: "",
    stats: {
      followers: 0,
      following: 0,
      skillsLearned: 0,
      skillsInProgress: 0,
      achievements: 0,
    },
    skills: [],
    learningGoals: [],
    certifications: [],
  });

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");

  // Sample activity data - would come from API
  const [activities, _setActivities] = useState([
    {
      id: 1,
      type: "skill_completed",
      content: "Completed Advanced React Hooks course with 96% score",
      skillName: "React Hooks",
      date: "2 days ago",
      likes: 24,
    },
    {
      id: 2,
      type: "achievement",
      content: "Earned Design System Architect badge",
      achievementName: "Design System Architect",
      date: "1 week ago",
      likes: 37,
    },
    {
      id: 3,
      type: "shared_resource",
      content:
        "This course on animation principles changed how I approach UI motion",
      resourceName: "Animation for UI/UX",
      resourceLink: "https://example.com/course",
      date: "2 weeks ago",
      likes: 18,
    },
  ]);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("No token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        setUser({
          id: data.id,
          name: data.username,
          title: data.role === "ADMIN" ? "Administrator" : "Member", // Optional logic
          avatar:
            data.profilePicUrl || data.profilePic || "/api/placeholder/120/120",
          coverPhoto: "/api/placeholder/1200/300", // Keep static or use backend if available
          bio: data.bio || "",
          location: "", // Add location if available in backend
          joinDate: new Date(data.registrationDate).toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          stats: {
            followers: data.followers?.length || 0,
            following: data.following?.length || 0,
            skillsLearned: data.skills?.length || 0,
            skillsInProgress: 0, // Update if you start tracking progress
            achievements: 0, // Update if backend supports achievements
          },
          skills:
            data.skills?.map((skill) => ({
              name: skill,
              level: "Beginner", // Default level until supported
              endorsements: Math.floor(Math.random() * 40), // Mock data
            })) || [],
          learningGoals: [], // Empty unless you fetch from a goal API
          certifications: [], // Empty unless you fetch from a cert API
        });

        setError(null);
      } catch (err) {
        setError("Failed to fetch user details: " + err.message);
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);
  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
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

    // Use the user ID to select a consistent color
    const index = userId
      ? parseInt(userId.toString().charAt(0), 10) % colors.length
      : 0;
    return colors[index];
  };

  // // Toggle follow state
  // const handleFollow = () => {
  //   setIsFollowing(!isFollowing);
  //   setUser((prev) => ({
  //     ...prev,
  //     stats: {
  //       ...prev.stats,
  //       followers: isFollowing
  //         ? prev.stats.followers - 1
  //         : prev.stats.followers + 1,
  //     },
  //   }));
  // };

  // Handle skill endorsement
  const handleEndorse = (skillName) => {
    setUser((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.name === skillName
          ? { ...skill, endorsements: skill.endorsements + 1 }
          : skill
      ),
    }));
  };
  console.log(user.avatar);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      {/* Cover Photo & Profile Summary */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover opacity-70"
          />
        </div>

        {/* Profile Summary Card */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-12 sm:-mt-16 mb-6">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:space-x-5">
                    <div className="flex-shrink-0">
                      {user?.avatar &&
                      !user.avatar.includes("/api/placeholder/") ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatar}
                          alt={user?.name || "User"}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {getInitials(user?.name)}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-left sm:flex-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {user.name}
                      </h1>
                      <p className="text-sm sm:text-base font-medium text-indigo-600">
                        {user.title}
                      </p>
                      <div>
                        {loading ? (
                          <p>Loading...</p>
                        ) : error ? (
                          <p>{error}</p>
                        ) : (
                          <ul>
                            {users.map((user) => (
                              <li key={user._id}>{user.username}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start text-sm text-gray-500 gap-x-4 gap-y-1">
                        <span className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {user.location}
                        </span>
                        <span className="flex items-center">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Joined {user.joinDate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-0 flex justify-center">
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isFollowing
                          ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4 text-sm text-gray-700">
                  <p>{user.bio}</p>
                </div>

                {/* User Stats */}
                <div className="mt-6 grid grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.stats.followers}
                    </div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.stats.following}
                    </div>
                    <div className="text-xs text-gray-500">Following</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.stats.skillsLearned}
                    </div>
                    <div className="text-xs text-gray-500">Skills</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.stats.skillsInProgress}
                    </div>
                    <div className="text-xs text-gray-500">Learning</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg py-2 px-4 col-span-3 lg:col-span-1">
                    <div className="text-2xl font-bold text-indigo-600">
                      {user.stats.achievements}
                    </div>
                    <div className="text-xs text-gray-500">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Skills, Badges, etc. */}
          <div className="md:w-1/3">
            {/* Skills Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Skills
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Verified skills with community endorsements
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <ul className="divide-y divide-gray-200">
                  {user.skills.map((skill, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {skill.name}
                          </h4>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                skill.level === "Expert"
                                  ? "bg-green-100 text-green-800"
                                  : skill.level === "Advanced"
                                  ? "bg-blue-100 text-blue-800"
                                  : skill.level === "Intermediate"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {skill.level}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEndorse(skill.name)}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600"
                        >
                          <svg
                            className="h-5 w-5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                          <span>{skill.endorsements}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Learning Goals Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Learning Goals
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Skills currently in progress
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <ul className="divide-y divide-gray-200">
                  {user.learningGoals.map((goal) => (
                    <li key={goal.id} className="py-3">
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {goal.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {goal.category}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {goal.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Certifications Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Certifications
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Verified achievements and credentials
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <ul className="divide-y divide-gray-200">
                  {user.certifications.map((cert, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {cert.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Issued by {cert.issuer} • {cert.date}
                          </p>
                        </div>
                        {cert.verified && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            <svg
                              className="mr-1 h-3 w-3 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Activities Feed */}
          <div className="md:w-2/3">
            {/* Tabs */}
            <div className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                {/* Post Creation Card (Facebook style) */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-200">
                  <div className="p-4">
                    <div
                      onClick={() => setShowCreatePostModal(true)}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="bg-gray-100 rounded-full px-4 py-2.5 flex-grow text-gray-500 hover:bg-gray-200">
                        What's on your mind, {user.name?.split(" ")[0]}?
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
                      <button
                        onClick={() => setShowCreatePostModal(true)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5"
                      >
                        <svg
                          className="h-5 w-5 text-red-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Photo/Video</span>
                      </button>

                      <button
                        onClick={() => setShowCreatePostModal(true)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5"
                      >
                        <svg
                          className="h-5 w-5 text-green-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Learning Update</span>
                      </button>

                      <button
                        onClick={() => setShowCreatePostModal(true)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5"
                      >
                        <svg
                          className="h-5 w-5 text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Learning Plan</span>
                      </button>
                    </div>
                  </div>
                </div>
                <nav className="flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "activity"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("shared")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "shared"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "achievements"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Achievements
                  </button>
                </nav>
              </div>
            </div>

            {/* Activities Feed */}
            <div className="space-y-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    {/* Activity Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      {activity.type === "skill_completed" && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <svg
                            className="mr-1.5 h-2 w-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Completed Skill
                        </span>
                      )}
                      {activity.type === "achievement" && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                          <svg
                            className="mr-1.5 h-2 w-2 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Achievement
                        </span>
                      )}
                      {activity.type === "shared_resource" && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <svg
                            className="mr-1.5 h-2 w-2 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Shared Resource
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {activity.date}
                      </span>
                    </div>

                    {/* Activity Content */}
                    <p className="text-gray-800 mb-3">{activity.content}</p>

                    {/* Additional activity details based on type */}
                    {activity.type === "skill_completed" &&
                      activity.skillName && (
                        <div className="mt-2 bg-indigo-50 rounded-lg p-4">
                          <h3 className="font-medium text-indigo-800">
                            {activity.skillName}
                          </h3>
                        </div>
                      )}

                    {activity.type === "achievement" &&
                      activity.achievementName && (
                        <div className="mt-2 bg-purple-50 rounded-lg p-4">
                          <h3 className="font-medium text-purple-800">
                            {activity.achievementName}
                          </h3>
                        </div>
                      )}

                    {activity.type === "shared_resource" &&
                      activity.resourceName && (
                        <div className="mt-2 bg-amber-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-amber-800">
                              {activity.resourceName}
                            </h3>
                            {activity.resourceLink && (
                              <a
                                href={activity.resourceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-600"
                              >
                                View
                                <svg
                                  className="ml-1 h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                    {/* Activity Footer */}
                    <div className="mt-4 flex items-center">
                      <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                        <svg
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                          />
                        </svg>
                        <span>{activity.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* More Activities Button */}
            <div className="mt-8 text-center">
              <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 font-medium transition-colors">
                Load More Activities
              </button>
            </div>
          </div>
        </div>
      </div>
      {showCreatePostModal && (
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
