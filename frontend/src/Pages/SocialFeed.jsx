import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserId } from "../util/auth";
import PostCard from "../Components/PostCard";
import CreatePostCard from "../Components/CreatePostCard";
import CreatePostModal from "../Components/Modals/CreatePost";
import Header from "../Components/Header";
import CustomLoader from "../Components/CustomLoader";
import { PlusIcon } from "lucide-react";

const SocialFeed = () => {
  const [user, setUser] = useState({ name: "", avatar: "" });
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch user data
          const fetchUser = async () => {
            const response = await axios.get(
              `http://localhost:8080/api/users/${loggedInUserId}`
            );
            setUser({
              ...response.data,
              name: response.data.username,
              avatar: response.data.profilePicUrl,
            });
          };

          // Fetch posts data
          const fetchPosts = async () => {
            const postsResponse = await axios.get(
              `http://localhost:8080/api/posts`
            );
            const postsData = postsResponse.data;

            // Filter out posts from the logged-in user
            const filteredPosts = postsData.filter(
              (post) => post.userId !== loggedInUserId
            );

            const userIds = [
              ...new Set(filteredPosts.map((post) => post.userId)),
            ];

            const userDetailsPromises = userIds.map((id) =>
              axios
                .get(`http://localhost:8080/api/users/${id}`)
                .then((res) => ({ id, ...res.data }))
                .catch(() => ({ id, username: "Unknown", profileImage: null }))
            );

            const usersDetails = await Promise.all(userDetailsPromises);

            const userMap = {};
            usersDetails.forEach((user) => {
              userMap[user.id] = user;
            });

            const postsWithUserDetails = filteredPosts.map((post) => ({
              ...post,
              userDetails: userMap[post.userId] || {},
            }));

            setPosts(postsWithUserDetails);
          };

          // Execute both fetches in parallel
          await Promise.all([fetchUser(), fetchPosts()]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [loggedInUserId]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(
      posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  // Function to safely format post content
  const formatPostContent = (post) => {
    if (!post.content) return "";

    if (typeof post.content === "object") {
      // If content is an object, safely extract the content property or stringify it
      return post.content.content || JSON.stringify(post.content);
    }

    // If content is not an object (string, number, etc.), convert to string
    return String(post.content);
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <Header />

      <div className="mr-10 ml-10 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sticky Create Post Card */}
        {/* <CreatePostCard
          user={user}
          setShowCreatePostModal={setShowCreatePostModal}
        /> */}

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

        {/* Masonry Layout using columns */}

        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {/* Skeleton items with different heights for masonry effect */}
            {[...Array(6)].map((_, index) => (
              <div key={index} className="mb-6 break-inside-avoid">
                <div className="bg-gray-300 dark:bg-gray-700 rounded-lg overflow-hidden shadow animate-pulse">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gray-400 dark:bg-gray-600"></div>
                  {/* Content placeholder */}
                  <div className="p-4">
                    <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded w-2/3 mb-4"></div>
                    {/* Action buttons placeholder */}
                    <div className="flex justify-between">
                      <div className="h-8 bg-gray-400 dark:bg-gray-600 rounded w-20"></div>
                      <div className="h-8 bg-gray-400 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="mb-6 break-inside-avoid">
                <div className="bg-gray-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <PostCard
                    post={post}
                    currentUser={user}
                    onPostUpdate={handlePostUpdate}
                    onPostDelete={handlePostDelete}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              No posts yet. Be the first to create one!
            </p>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreatePostModal && (
          <CreatePostModal
            isOpen={showCreatePostModal}
            onClose={() => setShowCreatePostModal(false)}
            onPostCreated={(newPost) => setPosts([newPost, ...posts])}
          />
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
