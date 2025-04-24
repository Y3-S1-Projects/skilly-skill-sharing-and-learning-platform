import React from "react";
import { Link } from "react-router-dom";
import { Share } from "lucide-react";

const PostComponent = ({
  posts,
  currentUser,
  onLike,
  authorInfo,
  context = "profile", // "profile" or "feed"
  followStatus = true, // true if already following, false if not following
  onFollowToggle,
}) => {
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

    // Use the user ID to select a consistent color
    const index = userId
      ? parseInt(userId.toString().charAt(0), 10) % colors.length
      : 0;
    return colors[index];
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

  // If no posts, show appropriate message
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden p-6 text-center text-gray-500">
        No posts yet
        {context === "profile" ? " from this user" : " in your feed"}
      </div>
    );
  }

  // If we have posts, render them
  return (
    <div className="space-y-6">
      {posts.map((post) => {
        // For feed context, we may need to use the post.author instead of the provided authorInfo
        const author = context === "feed" ? post.author : authorInfo;

        return (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-4 sm:p-6">
              {/* Post header with user info */}
              <div className="flex items-center mb-4">
                {author?.avatar &&
                !author.avatar.includes("/api/placeholder/") ? (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-10 w-10 rounded-full mr-3"
                  />
                ) : (
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClass(
                      author.id
                    )} mr-3`}
                  >
                    {getInitials(author.name)}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">{author.name}</h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {post.title}
              </h2>

              <p className="text-gray-700 mb-3">{post.content}</p>

              {/* Post media (if any) */}
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {post.mediaUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Post media ${index}`}
                      className="rounded-lg object-cover w-full h-48"
                    />
                  ))}
                </div>
              )}

              {/* Post footer with actions */}
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                {currentUser ? (
                  <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center ${
                      post.likes?.includes(currentUser.id)
                        ? "text-indigo-600"
                        : "text-gray-500 hover:text-indigo-600"
                    } transition-colors`}
                  >
                    <svg
                      className="h-5 w-5 mr-1"
                      fill={
                        post.likes?.includes(currentUser.id)
                          ? "currentColor"
                          : "none"
                      }
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
                    <span>{post.likes?.length || ""} Like</span>
                  </button>
                ) : (
                  <div className="flex items-center text-gray-500">
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
                  </div>
                )}
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span>{post.comments?.length || 0} Comments</span>
                </button>
                <Link
                  to={`/post/${post.id}`}
                  className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  <Share />
                  <span>Share</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostComponent;
