import { useState, useEffect, useRef } from "react";
import axios from "axios";
import CustomVideoPlayer from "./CustomeVideoPlayer";
import CommentsModal from "./Modals/CommentModal";
import { Link } from "react-router-dom";
import { Award, Bookmark, MessageCircle, ThumbsUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Tooltip from "@/components/custom/ToolTip";
import { useNotifications } from "../hooks/useNotifications";

const PostCard = ({
  post,
  currentUser,
  onPostUpdate,
  onPostDelete,
  isViewingProfile = true,
}) => {
  const [postOwner, setPostOwner] = useState(null);
  const modalRef = useRef();
  const navigate = useNavigate();
  const [commentOwners, setCommentOwners] = useState({});
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [commentDropdowns, setCommentDropdowns] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const { addNotification } = useNotifications();

  const [editData, setEditData] = useState({
    title: post.title,
    content: post.content,
    mediaUrls: post.mediaUrls || [],
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActionsDropdownOpen(false);
        setCommentDropdowns({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
  }, [post.userID]);

  useEffect(() => {
    // Set isSaved and savedCount when post is loaded
    if (post) {
      setIsSaved(post.savedBy.includes(currentUser.id));
      setSavedCount(post.savedBy.length);
    }
  }, [post, currentUser.id]);

  const fetchUserDetails = async (userId) => {
    if (!userId || commentOwners[userId]) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommentOwners((prev) => ({
        ...prev,
        [userId]: response.data,
      }));
    } catch {
      setCommentOwners((prev) => ({
        ...prev,
        [userId]: { username: "Deleted User" },
      }));
    }
  };

  useEffect(() => {
    const fetchAllNeededUsers = async () => {
      const userIds = new Set();

      // Add post author
      if (post.userId) userIds.add(post.userId);

      // Add comment authors
      if (post.comments) {
        post.comments.forEach((comment) => userIds.add(comment.userId));
      }

      // Fetch all unique users
      for (const userId of userIds) {
        if (!commentOwners[userId]) {
          await fetchUserDetails(userId);
        }
      }
    };

    fetchAllNeededUsers();
  }, [post]);

  const handleToggleSave = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/posts/${post.id}/save/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to toggle save");

      const updatedPost = await res.json();

      const userHasSaved = updatedPost.savedBy.includes(currentUser.id);
      setIsSaved(userHasSaved);
      setSavedCount(updatedPost.savedBy.length);
      addNotification({
        title: userHasSaved ? "Post Saved to profile" : "Post Unsaved",
      });
    } catch (error) {
      console.error("Save toggle error:", error);
      addNotification({
        title: "Error saving post ",
        type: "error",
      });
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
  const isPostOwner = post.userId === loggedInUser?.id;
  return (
    <div className="bg-gray-100  shadow-sm overflow-hidden border border-gray-800 hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        {/* Post Header */}
        <div className="flex items-center mb-4">
          {/* Avatar */}
          {postOwner?.profilePicUrl ? (
            <img
              src={postOwner.profilePicUrl}
              alt={postOwner?.username || "User"}
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

          {/* Name and timestamp */}
          <div>
            <h3 className="font-medium text-gray-800">
              {isViewingProfile && post.userId === currentUser.id ? (
                // Display as plain text if viewing own profile
                postOwner?.username
              ) : (
                // Otherwise make it a link
                <Link
                  to={`/profile/${postOwner?.id}`}
                  className="hover:underline"
                >
                  {postOwner?.username}
                </Link>
              )}

              {post.originalUserId && post.originalUserId !== post.userId && (
                <span className="text-sm text-gray-600 ml-1">
                  (original post by{" "}
                  {post.originalUserId === currentUser.id ? (
                    "you"
                  ) : (
                    <Link
                      to={`/profile/${post.originalUserId}`}
                      className="hover:underline"
                    >
                      {commentOwners[post.originalUserId]?.username}
                    </Link>
                  )}
                  )
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-600">
              {formatDate(post.createdAt)}
              {post.postType && (
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5  text-xs font-medium ${
                    post.postType === "skill"
                      ? "bg-orange-100 text-orange-800"
                      : post.postType === "progress"
                      ? "bg-blue-100 text-blue-800"
                      : post.postType === "plan"
                      ? "bg-green-100 text-green-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {post.postType}
                </span>
              )}
            </p>
          </div>

          {/* Post actions dropdown */}
          {isPostOwner && (
            <div className="ml-auto relative">
              <button
                onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                className="text-gray-800 hover:text-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>

              {actionsDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0  w-48 bg-gray-300  shadow-lg z-10 py-1 border border-gray-700"
                >
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActionsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
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
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActionsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      handleDeletePost();
                      setActionsDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-200"
                  >
                    <svg
                      className="h-4 w-4 mr-2"
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
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Content */}
        <h2 className="text-xl font-semibold text-black mb-2">
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
              className="w-full  border border-gray-600 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              placeholder="Post title"
            />
          ) : (
            <span
              className="hover:text-gray-800 transition-colors duration-200 cursor-pointer"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              {post.title}
            </span>
          )}
        </h2>

        <p className="text-gray-600 mb-3">
          {isEditing ? (
            <textarea
              value={editData.content}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  content: e.target.value,
                })
              }
              className="w-full  border border-gray-600 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400"
              rows="3"
              placeholder="Share your thoughts..."
            />
          ) : (
            <>
              <span
                className=" transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                {post.content}
              </span>
            </>
          )}
        </p>

        {/* Post Media */}
        {((post.mediaUrls && post.mediaUrls.length > 0) || post.videoUrl) && (
          <div className="mt-3">
            {/* Video display with custom player - placed first for prominence */}
            {post.videoUrl && (
              <div className="mb-2">
                <CustomVideoPlayer
                  videoUrl={post.videoUrl}
                  thumbnail={
                    post.mediaUrls && post.mediaUrls.length > 0
                      ? post.mediaUrls[0]
                      : undefined
                  }
                />

                {/* Video info */}
                {post.videoDuration && (
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <svg
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {Math.floor(post.videoDuration / 60)}:
                    {(post.videoDuration % 60).toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            )}

            {/* Image gallery - show in grid if there are multiple images */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div
                className={`grid ${
                  post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                } gap-2`}
              >
                {post.mediaUrls.map((url, index) => (
                  <div key={`image-${index}`} className="relative">
                    <img
                      src={url}
                      alt={`Post media ${index}`}
                      className="object-cover w-full h-auto"
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
              </div>
            )}

            {/* Edit mode media upload section */}
            {isEditing && (
              <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="flex items-center justify-center p-4">
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <label className="flex flex-col items-center justify-center cursor-pointer bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <svg
                        className="h-8 w-8 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Upload Images
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setEditData({
                              ...editData,
                              newImages: Array.from(e.target.files),
                            });
                          }
                        }}
                        accept="image/*"
                        multiple
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center cursor-pointer bg-gray-50  p-4 hover:bg-gray-100 transition-colors">
                      <svg
                        className="h-8 w-8 text-gray-400 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Upload Video
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        MP4, WebM up to 50MB
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setEditData({
                              ...editData,
                              newVideo: e.target.files[0],
                            });
                          }
                        }}
                        accept="video/*"
                      />
                    </label>
                  </div>
                </div>

                {/* Preview section for newly uploaded files */}
                <div className="px-4 pb-4">
                  {editData.newImages && editData.newImages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        New images to upload:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.from(editData.newImages).map((file, index) => (
                          <div key={`new-image-${index}`} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`New upload ${index}`}
                              className="h-16 w-16 object-cover rounded"
                            />
                            <button
                              onClick={() => {
                                const newImages = [...editData.newImages];
                                newImages.splice(index, 1);
                                setEditData({
                                  ...editData,
                                  newImages: newImages,
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                            >
                              <svg
                                className="h-3 w-3"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {editData.newVideo && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">
                        New video to upload:
                      </p>
                      <div className="flex items-center mt-2">
                        <svg
                          className="h-6 w-6 text-indigo-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-gray-700 truncate">
                          {editData.newVideo.name}
                        </span>
                        <button
                          onClick={() => {
                            setEditData({
                              ...editData,
                              newVideo: null,
                            });
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit mode save/cancel buttons */}
        {isEditing && (
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={handleUpdatePost}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700  hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Post footer with actions */}
        <div className="mt-4 flex items-center justify-between pt-3">
          <CommentsModal
            ref={modalRef}
            isOpen={isModalOpen}
            onClose={closeModal}
            post={post}
            commentOwners={commentOwners}
            currentUser={currentUser}
            loggedInUser={loggedInUser}
            getColorClass={getColorClass}
            getInitials={getInitials}
            formatDate={formatDate}
            onPostUpdate={onPostUpdate}
          />
        </div>
        <div className="px-4 py-4  border-t border-gray-600">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-700">
                <Users className="w-4 h-4" />
                <span>1.2k learners</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-700">
                <Award className="w-4 h-4" />
                <span>89% success rate</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 py-4 border-gray-600 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                className={`flex items-center space-x-2 px-4 py-2  transition-all cursor-pointer ${
                  post.likes.includes(loggedInUser?.id)
                    ? ""
                    : "text-gray-800 hover:text-black"
                } transition-colors`}
                onClick={handleLike}
              >
                <ThumbsUp
                  className="w-5 h-5"
                  fill={post.likes.includes(loggedInUser?.id) ? "gray" : "none"}
                />{" "}
                {/* Added size for consistency */}
                <span className="text-sm font-medium">
                  {post.likes?.length || 0}{" "}
                </span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={openModal}
                className="flex items-center space-x-2 px-4 py-2  text-gray-800 transition-colors cursor-pointer"
              >
                <MessageCircle className={`w-4 h-4 `} />
                <span className="font-medium">
                  {post.comments?.length || 0}
                </span>
              </button>

              <Tooltip title="Save this item to your collection" position="top">
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center space-x-2 px-4 py-2 transition-all ${
                    isSaved ? "text-blue-600" : "text-gray-800"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${
                      isSaved ? "fill-blue-600" : "fill-none"
                    }`}
                  />
                  <span className="font-medium">{savedCount}</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
