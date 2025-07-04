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
import EditIcon from "@/public/icons/EditIcon";
import CreatePostModal from "../Components/Modals/CreatePost";
import { Helmet } from "react-helmet";
import { getInitials } from "../util/avatar";
import { Spinner } from "@heroui/react";
const PublicProfile = () => {
  const { userId } = useParams(); // Get userId from URL parameter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [activeConnectionTab, setActiveConnectionTab] = useState("followers");
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [followLoading, setFollowLoading] = useState(false);
  const [showUnfollowModal, setShowUnfollowModal] = useState(false);
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
          skills: data.skills?.map((skill) => skill) || [],
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
    <>
      <Helmet>
        <title>{user?.name} on Skilly</title>
      </Helmet>
      <div className="min-h-screen bg-white">
        <Header user={currentUser} />
        {/* Cover Photo & Profile Summary */}
        <div className="bg-gray-600 px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Left Section - Profile Info */}
              <div className="flex items-start gap-6">
                {/* Profile Avatar */}
                <div className="flex-shrink-0">
                  {user?.avatar &&
                  !user.avatar.includes("/api/placeholder/") ? (
                    <img
                      className="h-24 w-24 rounded-full border-4 border-white/20"
                      src={user.avatar}
                      alt={user?.name || "User"}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-white/20 border-4 border-white/20 flex items-center justify-center text-white text-2xl font-medium">
                      {getInitials(user?.name)}
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {user.name}
                  </h1>
                  <p className="text-xl text-white/90 mb-4">{user.title}</p>

                  {/* Bio */}
                  <p className="text-white/80 text-base leading-relaxed mb-4 max-w-2xl">
                    {user.bio}
                  </p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/20 text-white text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Loading and Error States */}
                  <div className="mt-4">
                    {loading && <CustomLoader />}
                    {error && <p className="text-red-300">{error}</p>}
                  </div>
                </div>
              </div>

              {/* Right Section - Follow Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={
                    isFollowing
                      ? () => setShowUnfollowModal(true)
                      : handleFollowToggle
                  }
                  disabled={followLoading}
                  className={`px-6 py-3  font-medium text-sm transition-all duration-200 ${
                    isFollowing
                      ? "bg-white/20 text-white border-2 border-white/30 hover:bg-white/30"
                      : "bg-white text-black border-2 border-black hover:bg-white/90"
                  } ${
                    followLoading
                      ? "opacity-50 cursor-not-allowed"
                      : " active:scale-95"
                  }`}
                >
                  {followLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Following...
                    </span>
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              </div>

              {/* Unfollow Confirmation Modal */}
              {showUnfollowModal && (
                <div className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white  p-6 max-w-md mx-4 border-2 border-black">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Unfollow {user.name}?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You will no longer see their posts in your feed.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowUnfollowModal(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300  hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setShowUnfollowModal(false);
                          handleFollowToggle();
                        }}
                        disabled={followLoading}
                        className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Unfollow
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto">
            <div className=" ">
              <div className="grid grid-cols-3 divide-x divide-gray-200">
                {/* Posts */}
                <div className="px-8 py-6 text-center  transition-colors">
                  <div className="text-2xl font-bold text-gray-900">
                    {posts.length}
                  </div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>

                {/* Followers */}
                <div
                  className="px-8 py-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setActiveConnectionTab("followers");
                    setIsModalOpen(true);
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {user.stats.followers}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>

                {/* Following */}
                <div
                  className="px-8 py-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setActiveConnectionTab("following");
                    setIsModalOpen(true);
                  }}
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {user.stats.following}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UserConnectionsModal
          userId={user.id}
          isOwnProfile={false}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeTab={activeConnectionTab}
          setActiveTab={setActiveConnectionTab}
        />

        {/* Main Content Area */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 bg-gray-300">
          {" "}
          {/* Navigation Tabs */}
          <div className="bg-gray-300 border-b mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: "posts", label: "Posts" },
                { id: "skills", label: "Skills & Expertise" },
                { id: "about", label: "About" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Content based on active tab */}
          {activeTab === "posts" && (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {[...posts].reverse().map((post) => (
                <div key={post.id} className="mb-4 break-inside-avoid">
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={user}
                    onPostUpdate={handlePostUpdate}
                    onPostDelete={handlePostDelete}
                    showGallery={false}
                  />
                </div>
              ))}
            </div>
          )}
          {activeTab === "skills" && (
            <div className="flex flex-col md:flex-row gap-6">
              {/* Skills Section */}
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Skills
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Verified skills with community endorsements
                    </p>
                  </div>
                  <div className="px-6 py-4">
                    <ul className="divide-y divide-gray-200">
                      {user.skills.map((skill, index) => (
                        <li key={index} className="py-3">
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900">
                                {skill.name}
                              </h4>
                              <div className="mt-1">
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
                  </div>
                </div>
              </div>

              {/* Learning Goals Section */}
              <div className="md:w-1/2">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <Link
                    to="/learning-plans"
                    className="block w-full px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Learning Plans
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Skills currently in progress
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 transition-colors"
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
                    </div>
                  </Link>
                  <div className="px-6 py-4">
                    <ul className="divide-y divide-gray-200">
                      {user.learningGoals.map((goal) => (
                        <li key={goal.id} className="py-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {goal.name}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {goal.category}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                              <div
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-0">
                              {goal.progress}%
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === "about" && (
            <div className="bg-white  border border-gray-100 p-6 shadow-sm">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Bio
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {user.bio || (
                      <span className="text-gray-400 italic">
                        No bio provided
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="h-4 w-4 mr-2 text-gray-400"
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
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {showCreatePostModal && (
          <CreatePostModal
            isOpen={showCreatePostModal}
            onClose={() => setShowCreatePostModal(false)}
            onPostCreated={(newPost) => setPosts([newPost, ...posts])}
          />
        )}
      </div>
    </>
  );
};

export default PublicProfile;
