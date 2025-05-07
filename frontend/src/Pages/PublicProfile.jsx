import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import DocsIcon from "@/public/icons/DocsIcon";
import PostCard from "../Components/PostCard";
import StarsIcon from "@/public/icons/StarsIcon";
import { getSocket } from "../services/webSocketService";
import UserConnectionsModal from "../Components/Modals/UserConnections";
import UserJoinDate from "../Components/UserJoinDate";
import CustomLoader from "../Components/CustomLoader";

const PublicProfile = () => {
  const { userId } = useParams(); // Get userId from URL parameter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeConnectionTab, setActiveConnectionTab] = useState("followers");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [followLoading, setFollowLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [user, setUser] = useState({
    id: "",
    name: "",
    title: "",
    avatar: "",
    coverPhoto: "/api/placeholder/1200/300",
    bio: "",
    location: "",
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
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_BASE_URL}/api/users/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentUser(response.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await axios.get(
          `${API_BASE_URL}/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        // Set user data
        setUser({
          id: data.id,
          name: data.username,
          title: data.role === "ADMIN" ? "Administrator" : "Beginner",
          avatar:
            data.profilePicUrl || data.profilePic || "/api/placeholder/120/120",
          coverPhoto: "/api/placeholder/1200/300",
          bio: data.bio || "",
          location: data.location || "",
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
        });

        // Check if the current user is following this profile user
        const token2 = localStorage.getItem("authToken");
        if (token2) {
          const currentUserResponse = await axios.get(
            `${API_BASE_URL}/api/users/details`,
            {
              headers: { Authorization: `Bearer ${token2}` },
            }
          );

          if (currentUserResponse.data && data.followers) {
            // Check if current user's ID is in the followers array
            const isUserFollowing = data.followers.includes(
              currentUserResponse.data.id
            );
            setIsFollowing(isUserFollowing);
          }
        }

        // Fetch user posts
        const postsResponse = await axios.get(
          `${API_BASE_URL}/api/posts/user/${data.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(postsResponse.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch user profile: " + err.message);
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUserProfile();
  }, [userId]);
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

  const handleFollowToggle = async () => {
    try {
      // If already processing a request, ignore additional clicks
      if (followLoading) return;

      const token = localStorage.getItem("authToken");

      if (!token || !currentUser) {
        navigate("/login");
        return;
      }

      // Set loading state to true to prevent additional clicks
      setFollowLoading(true);

      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(
        `${API_BASE_URL}/api/users/${endpoint}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update following state
      setIsFollowing(!isFollowing);

      // Update follower count
      setUser((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          followers: isFollowing
            ? prev.stats.followers - 1
            : prev.stats.followers + 1,
        },
      }));
    } catch (err) {
      console.error(
        `Error ${isFollowing ? "unfollowing" : "following"} user:`,
        err
      );
    } finally {
      // Reset loading state when done
      setFollowLoading(false);
    }
  };
  const handlePostUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleLike = async (postId) => {
    try {
      if (!currentUser) return;

      const token = localStorage.getItem("authToken");
      const userId = currentUser.id;

      // Find the post in the current state
      const postToUpdate = posts.find((p) => p.id === postId);

      if (!postToUpdate) {
        console.error("Post not found in current state");
        return;
      }

      // Check if user already liked the post
      const isLiked = postToUpdate.likes.includes(userId);

      // Make API request
      const endpoint = isLiked ? "unlike" : "like";
      const response = await axios.put(
        `${API_BASE_URL}/api/posts/${postId}/${endpoint}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the posts state
      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );

      // Send WebSocket notification if the post owner is not the current user
      if (postToUpdate.userId !== userId) {
        const action = isLiked ? "UNLIKE" : "LIKE";
        const notification = {
          postId: postId,
          senderId: userId,
          action: action,
        };

        // Get the socket instance and emit the notification
        const socket = getSocket();
        if (socket) {
          socket.emit("like_notification", notification);
        } else {
          console.warn("Socket connection not available");
        }
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Handle skill endorsement
  const handleEndorse = async (skillName) => {
    try {
      if (!currentUser) return;

      const token = localStorage.getItem("authToken");

      await axios.put(
        `${API_BASE_URL}/api/users/endorse/${userId}/${skillName}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI
      setUser((prev) => ({
        ...prev,
        skills: prev.skills.map((skill) =>
          skill.name === skillName
            ? { ...skill, endorsements: skill.endorsements + 1 }
            : skill
        ),
      }));
    } catch (err) {
      console.error("Error endorsing skill:", err);
    }
  };

  if (loading) {
    return <CustomLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center text-red-500">
        {error}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-black">
      <Header user={currentUser} />

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
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div className="sm:flex sm:space-x-5">
                    <div className="flex-shrink-0">
                      {user?.avatar &&
                      !user.avatar.includes("/api/placeholder/") ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover border-4 border-white"
                          src={user.avatar}
                          alt={user?.name || "User"}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-200 font-medium text-xl border-4 border-white">
                          {getInitials(user?.name)}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-left sm:flex-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-200 flex items-center gap-2">
                        {user.name}
                        {currentUser.id === user.id && " (You)"}
                      </h1>

                      <p className="text-sm sm:text-base font-medium text-indigo-600">
                        {user.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start text-sm text-gray-500 gap-x-4 gap-y-1">
                        {user.location && (
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
                        )}
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
                  {currentUser && currentUser.id !== user.id && (
                    <div className="mt-5 sm:mt-0 flex justify-center">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          followLoading
                            ? "bg-gray-600 text-gray-100 cursor-not-allowed"
                            : isFollowing
                            ? "bg-gray-600 text-gray-100 hover:bg-gray-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {followLoading
                          ? "Processing..."
                          : isFollowing
                          ? "Following"
                          : "Follow"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="mt-4 text-sm text-gray-300">
                  <p>{user.bio}</p>
                </div>

                {/* User Stats */}
                <div className="mt-6 grid grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                  <div
                    className="bg-gray-700  rounded-lg py-2 px-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setActiveConnectionTab("followers");
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="text-2xl font-bold text-indigo-400 ">
                      {user.stats.followers}
                    </div>
                    <div className="text-xs text-gray-300">Followers</div>
                  </div>
                  <div
                    className="bg-gray-700 rounded-lg py-2 px-4 cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => {
                      setActiveConnectionTab("following");
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.following}
                    </div>
                    <div className="text-xs text-gray-300">Following</div>
                  </div>
                  <UserConnectionsModal
                    userId={user.id}
                    isOwnProfile={false}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    activeTab={activeConnectionTab}
                    setActiveTab={setActiveConnectionTab}
                  />

                  <div className="bg-gray-700 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.skillsLearned}
                    </div>
                    <div className="text-xs text-gray-300">Skills</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg py-2 px-4">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.skillsInProgress}
                    </div>
                    <div className="text-xs text-gray-300">Learning</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg py-2 px-4 col-span-3 lg:col-span-1">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.achievements}
                    </div>
                    <div className="text-xs text-gray-300">Achievements</div>
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
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-white">
                  Skills
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-400">
                  Verified skills with community endorsements
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                {user.skills.length === 0 ? (
                  <div className="py-3 text-center text-gray-500">
                    No skills listed yet
                  </div>
                ) : (
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
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Learning Goals Section */}
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
              <Link
                to="#"
                className="block w-full p-4 rounded-lg transition-all 
                hover:bg-gray-700 hover:shadow-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500
                group" // Added group for child hover effects
                aria-label="View Learning Plans"
              >
                <div className="transition-all group-hover:translate-x-1">
                  <h3 className="text-lg font-medium leading-6 text-white flex items-center">
                    Learning Plans
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1 text-gray-400 group-hover:text-blue-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-400 group-hover:text-gray-700">
                    Skills currently in progress - Click to view details
                  </p>
                </div>
              </Link>
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
          </div>

          {/* Right Column - Activities Feed */}
          <div className="md:w-2/3">
            {/* Tabs */}
            <div className="mb-6 bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "activity"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-300 hover:text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("shared")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "shared"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-300 hover:text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === "achievements"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-300 hover:text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    Achievements
                  </button>
                </nav>
              </div>
            </div>
            {activeTab === "activity" && (
              <div>
                {posts && posts.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onPostUpdate={handlePostUpdate}
                        onPostDelete={handlePostDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 bg-gray-700 py-6">
                    <svg
                      className="mx-auto h-12 w-12 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-200">
                      No skill posts yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      This user hasn't shared any skills, tutorials, or
                      knowledge posts yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "shared" && (
              <div className="bg-gray-700 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="text-center text-gray-500 py-6">
                  <DocsIcon />
                  <h3 className="mt-2 text-sm font-medium text-gray-200">
                    No resources yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    This user hasn't shared any learning resources, guides, or
                    materials yet.
                  </p>
                </div>
              </div>
            )}
            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="bg-gray-700 rounded-xl shadow-sm overflow-hidden p-6">
                <div className="text-center text-gray-500 py-6">
                  <StarsIcon />
                  <h3 className="mt-2 text-sm font-medium text-gray-200">
                    No achievements yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-300">
                    This user hasn't earned any badges or achievements yet in
                    their learning journey.
                  </p>
                </div>
              </div>
            )}
            <UserJoinDate user={currentUser} isPublic={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
