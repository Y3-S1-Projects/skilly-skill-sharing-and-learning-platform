import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserId } from "../util/auth";
import PostCard from "./PostCard";
import Header from "./Header";
import { getColorClass, getInitials } from "../util/avatar";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { comment } from "postcss";
import Tooltip from "@/components/custom/ToolTip";

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentOwners, setCommentOwners] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [postOwner, setPostOwner] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user and post in parallel
        const userId = await getUserId();
        const [userResponse, postResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/users/${userId}`),
          axios.get(`http://localhost:8080/api/posts/${id}`),
        ]);

        setUser(userResponse.data);

        // Ensure the post has all required properties
        const postData = {
          ...postResponse.data,
          likes: postResponse.data.likes || [],
          comments: postResponse.data.comments || [],
          sharedBy: postResponse.data.sharedBy || [],
        };
        setPost(postData);

        // Fetch related posts (by same author or same topic)
        if (postData.authorId) {
          const relatedResponse = await axios.get(
            `http://localhost:8080/api/posts?authorId=${postData.authorId}&limit=3&exclude=${id}`
          );
          setRelatedPosts(relatedResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error.response?.status === 404
            ? "Post not found"
            : "Failed to load the post"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsCommenting(true);
      const token = localStorage.getItem("authToken");
      const userId = await getUserId();
      const response = await axios.post(
        `http://localhost:8080/api/posts/${id}/comments`,
        {
          content: newComment,
          authorId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the post with the new comment
      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data],
      }));

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  useEffect(() => {
    const fetchPostOwnerDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const ownerId = post.userId;
        4;
        if (ownerId) {
          // Only fetch if ownerId exists
          const response = await axios.get(
            `${API_BASE_URL}/api/users/${ownerId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPostOwner(response.data);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    const fetchLoggedInUserDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(`${API_BASE_URL}/api/users/details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoggedInUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    const fetchAllCommentOwners = async () => {
      if (post?.comments && post.comments.length > 0) {
        // Create a set of unique user IDs to avoid duplicate requests
        const userIds = new Set(post.comments.map((comment) => comment.userId));

        // Fetch details for each unique user ID
        userIds.forEach((userId) => {
          fetchUserDetails(userId);
        });
      }
    };

    fetchLoggedInUserDetails();
    fetchPostOwnerDetails();
    fetchAllCommentOwners();
  }, [post?.userId]);

  const fetchUserDetails = async (userId) => {
    if (!userId || commentOwners[userId]) return; // Skip if already fetched

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommentOwners((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch (err) {
      console.error(`Error fetching user details for ${userId}:`, err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    // Show success message
    navigate("/", {
      state: {
        notification: {
          type: "success",
          message: "Post successfully deleted",
        },
      },
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Post not found</title>
        </Helmet>
        <div className="bg-black h-screen">
          <Header />
          <div className="container mx-auto px-4 py-12 ">
            <div className="bg-gray-800 border border-red-200 rounded-lg p-6 flex flex-col items-center text-center">
              <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
              <h2 className="text-xl font-semibold text-red-500 mb-2">
                {error}
              </h2>
              <p className="text-red-500 mb-4">
                The post you're looking for might have been deleted or doesn't
                exist.
              </p>
              <button
                onClick={goBack}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Helmet>
        <title>{post.title}</title>
      </Helmet>
      <div className="bg-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-6">
          {/* Main post container with max width */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm overflow-hidden">
              <PostCard
                post={post}
                currentUser={user}
                onPostUpdate={handlePostUpdate}
                onPostDelete={handlePostDelete}
                isViewingProfile={false}
                isDetailView={true}
              />
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                Comments ({post.comments.length})
              </h3>

              {/* Comment form */}
              <div className="mb-6">
                <div className="flex items-start space-x-3">
                  {user.profilePicUrl ? (
                    <img
                      src={user.profilePicUrl}
                      alt={user?.username || "User"}
                      className="h-10 w-10 rounded-full mr-3"
                    />
                  ) : (
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClass(
                        post.userId
                      )} font-medium`}
                    >
                      {getInitials(user?.username || "User")}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleAddComment}
                        disabled={isCommenting || !newComment.trim()}
                        className={`px-4 py-2 text-sm border border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                          !newComment.trim() || isCommenting
                            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                            : "text-gray-700 hover:bg-gray-300 bg-white"
                        }`}
                      >
                        {isCommenting ? "Posting..." : "Post"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments list */}
              {post.comments.length > 0 ? (
                <div className="space-y-4">
                  {post.comments.map((comment) => {
                    const isOwnComment = comment.authorId === user.id;
                    return (
                      <div
                        key={comment.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0">
                          <div className="flex-shrink-0">
                            {commentOwners[comment.userId]?.profilePicUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  commentOwners[comment.userId].profilePicUrl
                                }
                                alt={
                                  commentOwners[comment.userId]?.username ||
                                  "User"
                                }
                              />
                            ) : (
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClass(
                                  comment.userId
                                )} font-medium text-white`}
                              >
                                {getInitials(
                                  commentOwners[comment.userId]?.username || "U"
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <Tooltip title="View Profile">
                              <p
                                className="font-medium text-gray-700 hover:underline cursor-pointer"
                                onClick={() =>
                                  navigate(`/profile/${comment.userId}`)
                                }
                              >
                                {commentOwners[comment.userId]?.username ||
                                  (comment.userId === user.id
                                    ? user.name
                                    : "User")}
                              </p>
                            </Tooltip>

                            <span className="text-gray-400 text-xs">
                              {formatDate(comment.createdAt)}
                            </span>
                            {isOwnComment && (
                              <div className="relative">
                                <button
                                  onClick={() => {
                                    // Implement dropdown toggle if needed
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-400 text-lg">No comments yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Be the first to comment
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Related posts section with max width for overall container */}
          {relatedPosts.length > 0 && (
            <div className="mt-8 max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                More from this author
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    className="bg-white shadow-sm overflow-hidden"
                  >
                    <PostCard
                      post={relatedPost}
                      currentUser={user}
                      isViewingProfile={false}
                      isCompactView={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PostView;
