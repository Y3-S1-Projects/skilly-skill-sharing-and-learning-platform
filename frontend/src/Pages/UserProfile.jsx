"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import CreatePostModal from "../Components/Modals/CreatePost";
import CreatePostCard from "../Components/CreatePostCard";
import EditIcon from "@/public/icons/EditIcon";
import PostCard from "../Components/PostCard";
import UserConnectionsModal from "../Components/Modals/UserConnections";
import UserJoinDate from "../Components/UserJoinDate";
import CustomLoader from "../Components/CustomLoader";
const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeConnectionTab, setActiveConnectionTab] = useState("followers");
  const [posts, setPosts] = useState([]);
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

  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchUserDetailsAndPosts = async () => {
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
          title: data.role === "USER" ? "Beginner" : "Beginner",
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
        });

        const postsResponse = await axios.get(
          `http://localhost:8080/api/posts/user/${data.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(postsResponse.data);

        setError(null);
      } catch (err) {
        setError("Failed to fetch user details: " + err.message);
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetailsAndPosts();
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

    const index = userId
      ? parseInt(userId.toString().charAt(0), 10) % colors.length
      : 0;
    return colors[index];
  };

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:8080/api/posts/user/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Filter out shared versions of your own posts
      const filteredPosts = response.data.filter(
        (post) => !(post.originalUserId && post.originalUserId === user.id)
      );

      setPosts(filteredPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:8080/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the deleted post from state
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };
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

  const handlePostUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostShared = (sharedPost) => {
    // Add the shared post to the beginning of the posts array
    setPosts([sharedPost, ...posts]);
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />
      {/* Cover Photo & Profile Summary */}
      <div className="relative">
        {/* Profile Header Section */}
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
                    <span className="px-3 py-1 bg-white/20 text-white text-sm ">
                      UI/UX Design
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm ">
                      React
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm ">
                      Figma
                    </span>
                    <span className="px-3 py-1 bg-white/20 text-white text-sm ">
                      Accessibility
                    </span>
                  </div>

                  {/* Loading and Error States */}
                  <div className="mt-4">
                    {loading && <CustomLoader />}
                    {error && <p className="text-red-300">{error}</p>}
                  </div>
                </div>
              </div>

              {/* Right Section - Edit Profile Button */}
              <div className="flex">
                <Link
                  to="/profile/edit"
                  className="px-6 py-3 bg-white text-purple-600  font-medium hover:bg-gray-100 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white border-b">
          <div className="max-w-screen mx-auto px-6">
            <div className="flex justify-center lg:justify-start">
              <div className="grid grid-cols-3 divide-x divide-gray-200">
                {/* Posts */}
                <div className="px-8 py-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-2xl font-bold text-gray-900">42</div>
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

        {/* Join Date */}
        {/* <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center text-sm text-gray-500">
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
          </div>
        </div> */}

        {/* Connections Modal */}
        <UserConnectionsModal
          userId={user.id}
          isOwnProfile={true}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          activeTab={activeConnectionTab}
          setActiveTab={setActiveConnectionTab}
        />
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 bg-gray-300">
        {" "}
        {/* Navigation Tabs */}
        <div className="bg-gray-300 border-b mb-8">
          <nav className="flex space-x-8 " aria-label="Tabs">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "posts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "skills"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Skills & Expertise
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "about"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              About
            </button>
          </nav>
        </div>
        {/* Content based on active tab */}
        {activeTab === "posts" && (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {[...posts].reverse().map((post) => (
              <div className="mb-4 break-inside-avoid">
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                  onSharePost={handlePostShared}
                />
              </div>
            ))}
            <div className="break-inside-avoid columns-1">
              <UserJoinDate user={user} />
            </div>
          </div>
        )}
        {activeTab === "skills" && (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Skills Section */}
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Skills</h3>
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-600">{user.bio}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
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
  );
};

export default UserProfile;
