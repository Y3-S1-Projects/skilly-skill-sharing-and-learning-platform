import { useState, useEffect } from "react";
import axios from "axios";

const PostCard = ({ post, currentUser, onPostUpdate, onPostDelete }) => {
  const [commentInput, setCommentInput] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [postOwner, setPostOwner] = useState(null);
  const [commentOwner, setCommentOwner] = useState(null);
  const [commentOwners, setCommentOwners] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    mediaUrls: post.mediaUrls || [],
  });

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
    setCommentOwner(post?.comments.userID);
  }, [post.userID]);

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

  // Post operations
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userId = loggedInUser.id;
      const isLiked = post.likes.includes(userId);

      const endpoint = isLiked ? "unlike" : "like";
      const response = await axios.put(
        `http://localhost:8080/api/posts/${post.id}/${endpoint}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdate(response.data);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:8080/api/posts/${post.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onPostDelete(post.id);
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();

      formData.append("title", editData.title);
      formData.append("description", editData.content);

      // Add image handling logic here if needed
      // editData.newImages?.forEach((file) => {
      //   formData.append('images', file);
      // });

      const response = await axios.put(
        `http://localhost:8080/api/posts/${post.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onPostUpdate(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  // Comment operations
  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!commentInput.trim()) return;

      const response = await axios.post(
        `http://localhost:8080/api/posts/${post.id}/comments`,
        { content: commentInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdate(response.data);
      setCommentInput("");
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

  const handleUpdateComment = async (commentId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `http://localhost:8080/api/posts/${post.id}/comments/${commentId}`,
        { content: editCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdate(response.data);
      setEditingCommentId(null);
      setEditCommentContent("");
    } catch (err) {
      console.error("Error updating comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.delete(
        `http://localhost:8080/api/posts/${post.id}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onPostUpdate(response.data);
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };
  const isPostOwner = post.userId === loggedInUser?.id;
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        {/* Post Header */}
        <div className="flex items-center mb-4">
          {postOwner?.profilePicUrl ? (
            <img
              src={postOwner.profilePicUrl}
              alt={postOwner?.name || "User"}
              className="h-10 w-10 rounded-full mr-3"
            />
          ) : (
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClass(
                post.userId
              )} font-medium`}
            >
              {getInitials(postOwner?.username || "User")}
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">
              {post.userId === currentUser.id ? currentUser.name : "User"}
            </h3>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
          {/* Post Actions (Edit/Delete) */}
          {isPostOwner && (
            <div className="ml-auto flex flex-col space-y-2">
              <button
                onClick={handleDeletePost}
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
                onClick={() => setIsEditing(true)}
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
          )}
        </div>

        {/* Post Content */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({
                  ...editData,
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
          {isEditing ? (
            <textarea
              value={editData.content}
              onChange={(e) =>
                setEditData({
                  ...editData,
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

        {/* Post Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {post.mediaUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Post media ${index}`}
                  className="rounded-lg object-cover w-full h-48"
                />
                {isEditing && (
                  <button
                    onClick={() => {
                      const updatedMediaUrls = [...editData.mediaUrls];
                      updatedMediaUrls.splice(index, 1);
                      setEditData({
                        ...editData,
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
            {isEditing && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-48">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      // Handle adding new images
                      // This would need additional code for image handling
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
                    <p className="text-sm text-gray-500">Add more images</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Edit mode save/cancel buttons */}
        {isEditing && (
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleUpdatePost}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Post footer with actions */}
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <button
            onClick={handleLike}
            className={`flex items-center ${
              post.likes.includes(currentUser.id)
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
              {loggedInUser?.profilePicUrl ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={loggedInUser?.profilePicUrl}
                  alt={loggedInUser?.name || "User"}
                />
              ) : (
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${getColorClass(
                    loggedInUser?.id
                  )} font-medium`}
                >
                  {getInitials(loggedInUser?.name)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={handleAddComment}
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
                  key={comment.id || comment._id}
                  className="flex items-start space-x-3"
                >
                  {/* Avatar section */}
                  <div className="flex-shrink-0">
                    {commentOwners[comment.userId]?.profilePicUrl ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={commentOwners[comment.userId].profilePicUrl}
                        alt={commentOwners[comment.userId]?.username || "User"}
                      />
                    ) : (
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${getColorClass(
                          comment.userId
                        )} font-medium`}
                      >
                        {getInitials(
                          commentOwners[comment.userId]?.username || "U"
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment content section */}
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      {editingCommentId === comment.id ||
                      editingCommentId === comment._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editCommentContent}
                            onChange={(e) =>
                              setEditCommentContent(e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleUpdateComment(comment.id || comment._id)
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
                            {/* Username from comment owner data */}
                            <p className="text-sm font-medium text-gray-900">
                              {commentOwners[comment.userId]?.username ||
                                (comment.userId === currentUser.id
                                  ? currentUser.name
                                  : "User")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {comment.content}
                          </p>
                          {comment.userId === loggedInUser?.id && (
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => startEditingComment(comment)}
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteComment(comment.id || comment._id)
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
  );
};

export default PostCard;
