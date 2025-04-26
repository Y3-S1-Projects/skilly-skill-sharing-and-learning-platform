"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../Components/Header";
import CreatePostModal from "../Components/Modals/CreatePost";
import CreatePostCard from "../Components/CreatePostCard";
import EditIcon from "@/public/icons/EditIcon";
import { useNavigate } from "react-router-dom";
const UserProfile = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [learningPlans, setLearningPlans] = useState([]);
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

  // Comment states
  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");

  const [editingPostId, setEditingPostId] = useState(null);
  const [editPostData, setEditPostData] = useState({
    title: "",
    content: "",
    mediaUrls: [],
  });

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
          title: data.role === "ADMIN" ? "Administrator" : "Member",
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

        // Initialize comment inputs
        const initialCommentInputs = {};
        postsResponse.data.forEach((post) => {
          initialCommentInputs[post.id] = "";
        });
        setCommentInputs(initialCommentInputs);

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

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = user.id;

      const postToUpdate = posts.find((p) => p.id === postId);

      if (!postToUpdate) {
        console.error("Post not found in current state");
        return;
      }

      const isLiked = postToUpdate.likes.includes(userId);

      const endpoint = isLiked ? "unlike" : "like";
      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}/${endpoint}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );
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

  // Comment handlers
  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleAddComment = async (postId) => {
    try {
      const token = localStorage.getItem("authToken");
      const content = commentInputs[postId];

      if (!content.trim()) return;

      const response = await axios.post(
        `http://localhost:8080/api/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );

      // Clear the comment input
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleUpdateComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );

      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(
        `http://localhost:8080/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  // Add these handler functions after the handleDeleteComment function (around line 200)
  const handleUpdatePost = async (postId) => {
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("title", editPostData.title);
      formData.append("description", editPostData.content);

      // If you want to handle new images for updates, you would add them here
      // editPostData.newImages?.forEach((file) => {
      //   formData.append('images', file);
      // });

      const response = await axios.put(
        `http://localhost:8080/api/posts/${postId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPosts(
        posts.map((post) => (post.id === postId ? response.data : post))
      );
      setEditingPostId(null);
      setEditPostData({
        title: "",
        content: "",
        mediaUrls: [],
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
    const startEditingPost = (post) => {
      setEditingPostId(post.id);
      setEditPostData({
        title: post.title,
        content: post.content,
        mediaUrls: post.mediaUrls || [],
      });
    };

    const cancelEditingPost = () => {
      setEditingPostId(null);
      setEditPostData({
        title: "",
        content: "",
        mediaUrls: [],
      });
    };
  };

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
                      className="px-5 py-2.5 text-sm font-medium rounded-xl
                      bg-gradient-to-r from-indigo-500 to-purple-500 text-white
                      flex items-center justify-center gap-2
                      shadow-md hover:shadow-lg transition-all duration-300
                      hover:translate-y-px
                      focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
                    >
                      <EditIcon />
                      Edit Profile
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
                {/* Post Creation Card */}
                <CreatePostCard
                  user={user}
                  setShowCreatePostModal={setShowCreatePostModal}
                />
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
              {loading ? (
                <div className="text-center py-4">Loading posts...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-4">No posts yet</div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Replace the post header section with delete button (around line 470) with this updated version */}
                      <div className="flex items-center mb-4">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                        {/* Add delete and edit buttons in top right */}
                        <div className="ml-auto flex flex-col space-y-2">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="flex items-center text-gray-500 hover:text-red-600 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            <span>Delete</span>
                          </button>
                          <button
                            onClick={() => startEditingPost(post)}
                            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            <span>Edit</span>
                          </button>
                        </div>
                      </div>

                      {/* Replace the post title and content section (around line 490) with this updated version */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {editingPostId === post.id ? (
                          <input
                            type="text"
                            value={editPostData.title}
                            onChange={(e) =>
                              setEditPostData({
                                ...editPostData,
                                title: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          post.title
                        )}
                      </h2>

                      <p className="text-gray-700 mb-3">
                        {editingPostId === post.id ? (
                          <textarea
                            value={editPostData.content}
                            onChange={(e) =>
                              setEditPostData({
                                ...editPostData,
                                content: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                          />
                        ) : (
                          post.content
                        )}
                      </p>

                      {/* Replace the post media section (around line 495) with this updated version */}
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {post.mediaUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Post media ${index}`}
                                className="rounded-lg object-cover w-full h-48"
                              />
                              {editingPostId === post.id && (
                                <button
                                  onClick={() => {
                                    // Handle removing this image
                                    const updatedMediaUrls = [
                                      ...editPostData.mediaUrls,
                                    ];
                                    updatedMediaUrls.splice(index, 1);
                                    setEditPostData({
                                      ...editPostData,
                                      mediaUrls: updatedMediaUrls,
                                    });
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          {editingPostId === post.id && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48">
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    // Handle adding new images
                                    // You would need to add this to your editPostData state
                                    // and handle the upload in your update function
                                  }}
                                  multiple
                                />
                                <div className="text-center p-4">
                                  <svg
                                    className="mx-auto h-8 w-8 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                  <p className="text-sm text-gray-500">
                                    Add more images
                                  </p>
                                </div>
                              </label>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add save/cancel buttons when in edit mode (after the post media section) */}
                      {editingPostId === post.id && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdatePost(post.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEditingPost}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Post footer with actions */}
                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center ${
                            post.likes.includes(user.id)
                              ? "text-indigo-600"
                              : "text-gray-500 hover:text-indigo-600"
                          } transition-colors`}
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
                          <span>{post.likes?.length || 0} Likes</span>
                        </button>
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
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>{post.comments?.length || 0} Comments</span>
                        </button>
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
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>

                      {/* Comments section */}
                      <div className="mt-4 border-t pt-4">
                        {/* Comment input */}
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="flex-shrink-0">
                            {user?.avatar &&
                            !user.avatar.includes("/api/placeholder/") ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={user.avatar || "/placeholder.svg"}
                                alt={user?.name || "User"}
                              />
                            ) : (
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center ${getColorClass(
                                  user.id
                                )} font-medium`}
                              >
                                {getInitials(user?.name)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex">
                              <input
                                type="text"
                                value={commentInputs[post.id] || ""}
                                onChange={(e) =>
                                  handleCommentInputChange(
                                    post.id,
                                    e.target.value
                                  )
                                }
                                placeholder="Write a comment..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="ml-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Comments list */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-3">
                            {post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex items-start space-x-3"
                              >
                                <div className="flex-shrink-0">
                                  <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center ${getColorClass(
                                      comment.userId
                                    )} font-medium`}
                                  >
                                    {getInitials(
                                      comment.userId === user.id
                                        ? user.name
                                        : "U"
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    {editingCommentId === comment.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={editCommentContent}
                                          onChange={(e) =>
                                            setEditCommentContent(
                                              e.target.value
                                            )
                                          }
                                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                          rows="2"
                                        />
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() =>
                                              handleUpdateComment(
                                                post.id,
                                                comment.id
                                              )
                                            }
                                            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={cancelEditingComment}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex justify-between items-start">
                                          <p className="text-sm font-medium text-gray-900">
                                            {comment.userId === user.id
                                              ? "You"
                                              : "User"}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {formatDate(comment.createdAt)}
                                          </p>
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">
                                          {comment.content}
                                        </p>
                                        {comment.userId === user.id && (
                                          <div className="flex space-x-2 mt-2">
                                            <button
                                              onClick={() =>
                                                startEditingComment(comment)
                                              }
                                              className="text-xs text-indigo-600 hover:text-indigo-800"
                                            >
                                              Edit
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleDeleteComment(
                                                  post.id,
                                                  comment.id
                                                )
                                              }
                                              className="text-xs text-red-600 hover:text-red-800"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
