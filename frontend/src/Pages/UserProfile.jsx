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

  const [activeTab, setActiveTab] = useState("activity");

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
    <div className="min-h-screen bg-black">
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
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
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
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-300 font-medium">
                          {getInitials(user?.name)}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-left sm:flex-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-300">
                        {user.name}
                      </h1>
                      <p className="text-sm sm:text-base font-medium text-indigo-500">
                        {user.title}
                      </p>
                      <div>
                        {loading && <CustomLoader />}
                        {error && <p className="text-red-500">{error}</p>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start text-sm text-gray-500 gap-x-4 gap-y-1">
                        {/* <span className="flex items-center">
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
                        </span> */}
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
                    <Link
                      to="/profile/edit"
                      className="px-5 py-2.5 text-sm font-medium rounded-xl
    bg-gradient-to-r from-indigo-500 to-purple-500 text-white
    flex items-center justify-center gap-2
    shadow-md hover:shadow-lg transition-all duration-300
    hover:from-indigo-600 hover:to-purple-600
    active:scale-[0.98] transform
    focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800
    relative overflow-hidden group"
                    >
                      {/* Gradient overlay on hover */}
                      <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                      {/* Button content */}
                      <span className="relative z-10 flex items-center gap-2">
                        <EditIcon className="w-4 h-4" />
                        Edit Profile
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-4 text-sm text-gray-300">
                  <p>{user.bio}</p>
                </div>

                {/* User Stats */}
                <div className="mt-6 grid grid-cols-3 lg:grid-cols-5 gap-3">
                  {/* Followers */}
                  <div
                    className="bg-gray-700 rounded-lg py-3 px-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200 group"
                    onClick={() => {
                      setActiveConnectionTab("followers");
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="text-2xl font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      {user.stats.followers}
                    </div>
                    <div className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">
                      Followers
                    </div>
                  </div>

                  {/* Following */}
                  <div
                    className="bg-gray-700 rounded-lg py-3 px-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200 group"
                    onClick={() => {
                      setActiveConnectionTab("following");
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="text-2xl font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                      {user.stats.following}
                    </div>
                    <div className="text-xs text-gray-300 group-hover:text-gray-200 transition-colors">
                      Following
                    </div>
                  </div>

                  {/* Skills Learned */}
                  <div className="bg-gray-700 rounded-lg py-3 px-4 hover:bg-gray-600 transition-colors duration-200">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.skillsLearned}
                    </div>
                    <div className="text-xs text-gray-300">Skills</div>
                  </div>

                  {/* Skills in Progress */}
                  <div className="bg-gray-700 rounded-lg py-3 px-4 hover:bg-gray-600 transition-colors duration-200">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.skillsInProgress}
                    </div>
                    <div className="text-xs text-gray-300">Learning</div>
                  </div>

                  {/* Achievements */}
                  <div className="bg-gray-700 rounded-lg py-3 px-4 hover:bg-gray-600 transition-colors duration-200 col-span-3 lg:col-span-1">
                    <div className="text-2xl font-bold text-indigo-400">
                      {user.stats.achievements}
                    </div>
                    <div className="text-xs text-gray-300">Achievements</div>
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
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-700">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-700">
                <h3 className="text-lg font-medium leading-6 text-white">
                  Skills
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-400">
                  Verified skills with community endorsements
                </p>
              </div>
              <div className="px-4 py-3 sm:px-6">
                <ul className="divide-y divide-gray-700">
                  {user.skills.map((skill, index) => (
                    <li
                      key={index}
                      className="py-3 hover:bg-gray-750 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {skill.name}
                          </h4>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                skill.level === "Expert"
                                  ? "bg-green-900/30 text-green-400"
                                  : skill.level === "Advanced"
                                  ? "bg-blue-900/30 text-blue-400"
                                  : skill.level === "Intermediate"
                                  ? "bg-indigo-900/30 text-indigo-400"
                                  : "bg-purple-900/30 text-purple-400"
                              }`}
                            >
                              {skill.level}
                            </span>
                          </div>
                        </div>
                        {/* <div className="ml-4 flex-shrink-0">
                          <span className="text-xs text-gray-400">
                            {skill.endorsements} endorsements
                          </span>
                        </div> */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Learning Goals Section */}
            <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-700">
              <Link
                to="/learning-plans"
                className="block w-full p-4 rounded-lg transition-all 
    hover:bg-gray-700 hover:shadow-sm 
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    group"
                aria-label="View Learning Plans"
              >
                <div className="transition-all group-hover:translate-x-1">
                  <h3 className="text-lg font-medium leading-6 text-white flex items-center">
                    Learning Plans
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1 text-gray-400 group-hover:text-indigo-400 transition-colors"
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
                  <p className="mt-1 max-w-2xl text-sm text-gray-400 group-hover:text-gray-300">
                    Skills currently in progress - Click to view details
                  </p>
                </div>
              </Link>
              <div className="px-4 py-3 sm:px-6">
                <ul className="divide-y divide-gray-700">
                  {user.learningGoals.map((goal) => (
                    <li
                      key={goal.id}
                      className="py-3 hover:bg-gray-750 transition-colors duration-150"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium text-white">
                            {goal.name}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {goal.category}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                              <div
                                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-400">
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
            {/* Tabs Container */}
            <div className="mb-6 bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-700">
              <div className="border-b border-gray-700">
                {/* Post Creation Card */}
                <CreatePostCard
                  user={user}
                  setShowCreatePostModal={setShowCreatePostModal}
                />

                {/* Tabs Navigation */}
                <nav className="flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "activity"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("shared")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "shared"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    Resources
                  </button>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "achievements"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    Achievements
                  </button>
                </nav>
              </div>
            </div>

            {/* Activities Feed */}
            <div className="space-y-6">
              {[...posts].reverse().map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                  onSharePost={handlePostShared}
                />
              ))}
              <UserJoinDate user={user} />
            </div>
          </div>
        </div>
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
