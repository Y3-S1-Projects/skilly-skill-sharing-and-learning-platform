"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import CreatePostModal from "../Components/Modals/CreatePost";
import EditIcon from "@/public/icons/EditIcon";
import PostCard from "../Components/PostCard";
import UserConnectionsModal from "../Components/Modals/UserConnections";
import {
  Zap as LightningBolt,
  GraduationCap as AcademicCap,
  MessageSquare as ChatBubble,
  Users,
  Calendar,
  ThumbsUp,
  PlusCircle,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Bookmark, PlusIcon } from "lucide-react";
import CustomLoader from "../Components/CustomLoader";
import Tooltip from "@/components/custom/ToolTip";
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
  const navigate = useNavigate();

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

  if (loading) {
    return <CustomLoader />;
  }
  return (
    <>
      {user?.name && (
        <Helmet>
          <title>{user.name} | Skilly</title>
        </Helmet>
      )}
      <div className="min-h-screen bg-white">
        <Header user={user} />
        {/* Cover Photo & Profile Summary */}
        <div className="relative">
          {/* Profile Header Section */}
          <div className="bg-gray-600 px-6 py-12">
            <div className="max-w-5xl mx-auto">
              {loading ? (
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Left Section - Profile Info Skeleton */}
                  <div className="flex items-start gap-6 w-full">
                    {/* Profile Avatar Skeleton */}
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full bg-gray-500 border-4 border-white/20 animate-pulse"></div>
                    </div>

                    {/* Profile Details Skeleton */}
                    <div className="flex-1 space-y-4">
                      {/* Name Skeleton */}
                      <div className="h-8 w-64 bg-gray-500 rounded animate-pulse"></div>

                      {/* Title Skeleton */}
                      <div className="h-6 w-48 bg-gray-500 rounded animate-pulse"></div>

                      {/* Bio Skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-500 rounded animate-pulse"></div>
                        <div className="h-4 w-5/6 bg-gray-500 rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-500 rounded animate-pulse"></div>
                      </div>

                      {/* Skills Tags Skeleton */}
                      <div className="flex flex-wrap gap-2">
                        <div className="h-6 w-16 bg-gray-500 rounded animate-pulse"></div>
                        <div className="h-6 w-12 bg-gray-500 rounded animate-pulse"></div>
                        <div className="h-6 w-14 bg-gray-500 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-gray-500 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
                        {user.skills.map((skill) => (
                          <span
                            key={skill.name}
                            className="px-3 py-1 bg-white/20 text-white text-sm"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4">
                        {error && <p className="text-red-300">{error}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="px-8 py-6 text-center">
                      <div className="h-8 w-12 mx-auto bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-16 mx-auto bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 divide-x divide-gray-200">
                  {/* Posts */}
                  <div className="px-8 py-6 text-center transition-colors">
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
              )}
            </div>
          </div>

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
        <div className="w-full max-w-7xl mx-auto bg-gray-300 px-4 sm:px-6 lg:px-8 pb-2 pt-2">
          <div className="flex justify-between items-center w-full my-4">
            <span className="text-2xl text-gray-900">
              What's on your mind today?
            </span>
            <button
              onClick={() => navigate("/create-post")}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-800 shadow-sm  cursor-pointer hover:bg-gradient-to-b from-gray-200 to-gray-300 transition-colors duration-200"
            >
              <PlusIcon size={20} className="text-gray-800" />
              <span className="text-gray-900 font-medium">Create a Post</span>
            </button>
          </div>
        </div>
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
                { id: "activities", label: "Activities" },
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
            <div>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                {loading ? (
                  // Loading skeleton
                  [...Array(6)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="mb-4 break-inside-avoid"
                    >
                      <div className="bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow animate-pulse">
                        {/* Image placeholder */}
                        <div className="h-48 bg-gray-400 dark:bg-gray-600"></div>
                        {/* Content placeholder */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-400 dark:bg-gray-600"></div>
                            <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-24"></div>
                          </div>
                          <div className="h-5 bg-gray-400 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full"></div>
                          <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-5/6"></div>
                          <div className="flex justify-between pt-2">
                            <div className="h-8 w-20 bg-gray-400 dark:bg-gray-600 rounded"></div>
                            <div className="h-8 w-20 bg-gray-400 dark:bg-gray-600 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : posts.length > 0 ? (
                  // Actual posts
                  [...posts].reverse().map((post) => (
                    <div key={post.id} className="mb-4 break-inside-avoid">
                      <PostCard
                        post={post}
                        currentUser={user}
                        onPostUpdate={handlePostUpdate}
                        onPostDelete={handlePostDelete}
                        onSharePost={handlePostShared}
                      />
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="col-span-full text-center py-16">
                    <p className="text-gray-400 text-lg">
                      No posts yet. Be the first to create one!
                    </p>
                  </div>
                )}
              </div>
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
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">About</h3>
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:text-gray-500 transition-colors  hover:bg-gray-50"
                >
                  <EditIcon className="w-4 h-4" />
                  Edit Profile
                </Link>
              </div>

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
          {activeTab === "activities" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Saved Posts */}
                <Tooltip title="View your saved posts">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <Bookmark className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Saved Posts</span>
                  </div>
                </Tooltip>

                {/* Your Skills */}
                <Tooltip title="Manage your listed skills">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <LightningBolt className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Your Skills</span>
                  </div>
                </Tooltip>

                {/* Learning Path */}
                <Tooltip title="View your learning progress">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <AcademicCap className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Learning Path</span>
                  </div>
                </Tooltip>

                {/* Messages */}
                <Tooltip title="View your messages">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <ChatBubble className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Messages</span>
                  </div>
                </Tooltip>

                {/* Connections */}
                <Tooltip title="Manage your connections">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <Users className="w-5 h-5 text-red-500" />
                    <span className="font-medium">Connections</span>
                  </div>
                </Tooltip>

                {/* Upcoming Sessions */}
                <Tooltip title="View scheduled sessions">
                  <div className="bg-white border border-gray-200 p-4 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium">Upcoming Sessions</span>
                  </div>
                </Tooltip>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                <p className="text-gray-700 mb-4">
                  This section showcases your recent activities, achievements,
                  and contributions on the platform.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">You</span> liked a post
                      about{" "}
                      <span className="text-blue-600">GraphQL basics</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <PlusCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">You</span> added a new
                      skill:{" "}
                      <span className="text-green-600">UI/UX Design</span>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <ChatBubble className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Alex</span> commented on
                      your{" "}
                      <span className="text-purple-600">React tutorial</span>
                    </p>
                  </div>
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

export default UserProfile;
