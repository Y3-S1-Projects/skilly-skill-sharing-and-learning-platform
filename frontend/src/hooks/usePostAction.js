import { useState } from "react";
import axios from "axios";

export const useLikePost = (initialPosts, currentUser) => {
  const [posts, setPosts] = useState(initialPosts);

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
        `http://localhost:8080/api/posts/${postId}/${endpoint}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? response.data : post))
      );
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  return { posts, handleLike };
};
