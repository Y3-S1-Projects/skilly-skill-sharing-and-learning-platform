import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getUserId } from "../util/auth";
import PostCard from "../Components/PostCard";
import CreatePostCard from "../Components/CreatePostCard";
import CreatePostModal from "../Components/Modals/CreatePost";
import Header from "../Components/Header";

const SocialFeed = () => {
  const [user, setUser] = useState({ name: "", avatar: "" });
  const [posts, setPosts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/users/${loggedInUserId}`
          );
          setUser({
            ...response.data,
            name: response.data.username,
            avatar: response.data.profilePicUrl,
          });
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };

      const fetchPosts = async () => {
        try {
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
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };

      fetchUser();
      fetchPosts();
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

  const filterPosts = (filter) => {
    setActiveFilter(filter);
  };

  const handleLike = (postId) => {
    console.log(`Liked post ${postId}`);
  };
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <CreatePostCard
          user={user}
          setShowCreatePostModal={setShowCreatePostModal}
        />
        {posts.map((post) => (
          <div key={post.id} className="mb-6">
            <PostCard
              key={post.id}
              post={post}
              currentUser={user}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
              isViewingProfile={false}
            />
          </div>
        ))}
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

export default SocialFeed;
