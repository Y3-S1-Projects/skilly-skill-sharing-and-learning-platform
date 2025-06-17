import { useState, useImperativeHandle, forwardRef, useRef } from "react";
import axios from "axios";

const CommentsModal = forwardRef(
  (
    {
      isOpen,
      onClose,
      post,
      commentOwners,
      currentUser,
      loggedInUser,
      getColorClass,
      getInitials,
      formatDate,
      onPostUpdate,
    },
    ref
  ) => {
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [dropdownOpenId, setDropdownOpenId] = useState(null);
    const [commentInput, setCommentInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);
    const modalRef = useRef();

    // Expose method to parent
    useImperativeHandle(ref, () => ({
      resetEditingState: () => {
        setEditingCommentId(null);
        setEditCommentContent("");
      },
    }));
    const startEditingComment = (comment) => {
      setEditingCommentId(comment.id || comment._id);
      setEditCommentContent(comment.content);
      setDropdownOpenId(null);
    };

    const cancelEditingComment = () => {
      setEditingCommentId(null);
      setEditCommentContent("");
    };

    const toggleDropdown = (commentId) => {
      setDropdownOpenId(dropdownOpenId === commentId ? null : commentId);
    };

    if (!isOpen) return null;

    // Separate comments into logged-in user's comments and others
    const loggedInUserComments =
      post.comments?.filter((comment) => comment.userId === loggedInUser?.id) ||
      [];

    const otherComments =
      post.comments?.filter((comment) => comment.userId !== loggedInUser?.id) ||
      [];

    const handleAddComment = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!commentInput.trim()) return;

        setIsLoading(true);

        const response = await axios.post(
          `http://localhost:8080/api/posts/${post.id}/comments`,
          { content: commentInput },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        onPostUpdate(response.data);
        setCommentInput("");
      } catch (err) {
        console.error("Error adding comment:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const handleUpdateComment = async (commentId, commentContent) => {
      try {
        const token = localStorage.getItem("authToken");
        setIsUpdateLoading(true);
        const response = await axios.put(
          `http://localhost:8080/api/posts/${post.id}/comments/${commentId}`,
          { content: commentContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        onPostUpdate(response.data);
        setEditingCommentId(null);
        setEditCommentContent("");
      } catch (err) {
        console.error("Error updating comment:", err);
      } finally {
        setIsUpdateLoading(false);
      }
    };

    const handleDeleteComment = async (commentId) => {
      try {
        const token = localStorage.getItem("authToken");
        setIsDeleteLoading(true);
        const response = await axios.delete(
          `http://localhost:8080/api/posts/${post.id}/comments/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        onPostUpdate(response.data);
      } catch (err) {
        console.error("Error deleting comment:", err);
      } finally {
        setIsDeleteLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-200 border border-black shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
            <div>
              <h3 className="text-xl font-semibold text-gray-700">Comments</h3>
              <p className="text-sm text-gray-500 mt-1">{post.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 cursor-pointer transition-colors p-1 hover:text-red-700"
            >
              <svg
                className="h-6 w-6"
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

          {/* Comments Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Logged-in user's comments first */}
            {loggedInUserComments.length > 0 && (
              <div className="space-y-6 mb-6">
                {loggedInUserComments.map((comment) => (
                  <CommentItem
                    key={comment.id || comment._id}
                    comment={comment}
                    commentOwners={commentOwners}
                    currentUser={currentUser}
                    loggedInUser={loggedInUser}
                    editingCommentId={editingCommentId}
                    editCommentContent={editCommentContent}
                    setEditCommentContent={setEditCommentContent}
                    handleUpdateComment={handleUpdateComment}
                    cancelEditingComment={cancelEditingComment}
                    dropdownOpenId={dropdownOpenId}
                    toggleDropdown={toggleDropdown}
                    startEditingComment={startEditingComment}
                    handleDeleteComment={handleDeleteComment}
                    getColorClass={getColorClass}
                    getInitials={getInitials}
                    formatDate={formatDate}
                    isUpdateLoading={isUpdateLoading}
                    isDeleteLoading={isDeleteLoading}
                  />
                ))}
              </div>
            )}

            {/* Other users' comments */}
            {otherComments.length > 0 ? (
              <div className="space-y-6">
                {otherComments.map((comment) => (
                  <CommentItem
                    key={comment.id || comment._id}
                    comment={comment}
                    commentOwners={commentOwners}
                    currentUser={currentUser}
                    loggedInUser={loggedInUser}
                    editingCommentId={editingCommentId}
                    editCommentContent={editCommentContent}
                    setEditCommentContent={setEditCommentContent}
                    handleUpdateComment={handleUpdateComment}
                    cancelEditingComment={cancelEditingComment}
                    dropdownOpenId={dropdownOpenId}
                    toggleDropdown={toggleDropdown}
                    startEditingComment={startEditingComment}
                    handleDeleteComment={handleDeleteComment}
                    getColorClass={getColorClass}
                    getInitials={getInitials}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : loggedInUserComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <p className="text-gray-400 text-lg">No comments yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Be the first to comment
                </p>
              </div>
            ) : null}
            {/* Comments section */}
            <div className="mt-4 pt-4">
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  {loggedInUser?.profilePicUrl ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={loggedInUser?.profilePicUrl}
                      alt={loggedInUser?.username || "User"}
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${getColorClass(
                        loggedInUser?.id
                      )} font-medium`}
                    >
                      {getInitials(loggedInUser?.username)}
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
                      className="flex-1 border text-gray-700 border-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleAddComment}
                      className={`ml-2 px-4 py-2 text-sm border border-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                        !commentInput || isLoading
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-300 bg-white"
                      }`}
                      disabled={!commentInput || isLoading}
                      aria-busy={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">Posting...</span>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// Extracted CommentItem component for better readability
const CommentItem = ({
  comment,
  commentOwners,
  currentUser,
  loggedInUser,
  editingCommentId,
  editCommentContent,
  setEditCommentContent,
  handleUpdateComment,
  cancelEditingComment,
  dropdownOpenId,
  toggleDropdown,
  startEditingComment,
  handleDeleteComment,
  getColorClass,
  getInitials,
  formatDate,
  isUpdateLoading,
  isDeleteLoading,
}) => {
  return (
    <div className="flex gap-4 items-start">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {commentOwners[comment.userId]?.profilePicUrl ? (
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={commentOwners[comment.userId].profilePicUrl}
            alt={commentOwners[comment.userId]?.username || "User"}
          />
        ) : (
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${getColorClass(
              comment.userId
            )} font-medium text-white`}
          >
            {getInitials(commentOwners[comment.userId]?.username || "U")}
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="border border-black p-4">
          {/* Comment Header */}
          <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-700">
                {commentOwners[comment.userId]?.username ||
                  (comment.userId === currentUser.id
                    ? currentUser.name
                    : "User")}
              </p>
              <span className="text-xs text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Three-dot dropdown menu (only show if owner) */}
            {comment.userId === loggedInUser?.id && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown(comment.id || comment._id)}
                  className="text-black hover:text-gray-600 p-1 rounded-full  transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpenId === (comment.id || comment._id) && (
                  <div className="absolute right-0 mt-2 w-32 bg-gray-400 shadow-lg z-10 border border-black">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          startEditingComment(comment);
                          setDropdownOpenId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (!isDeleteLoading) {
                            handleDeleteComment(comment.id || comment._id);
                            setDropdownOpenId(null);
                          }
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        disabled={isDeleteLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {isDeleteLoading && (
            <div className="text-sm text-gray-500 mt-1">Deleting...</div>
          )}

          {/* Comment Body */}
          {editingCommentId === comment.id ||
          editingCommentId === comment._id ? (
            <div className="space-y-3 mt-2">
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                className="w-full bg-gray-300 focus:outline-black border border-black px-4 py-2  text-black text-sm"
                rows="3"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelEditingComment}
                  className="px-4 py-2 text-red-500 cursor-pointer hover:bg-red-500 hover:text-white border border-black transition-colors text-sm"
                  disabled={isUpdateLoading} // Disable during loading
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleUpdateComment(
                      comment.id || comment._id,
                      editCommentContent
                    )
                  }
                  className={`px-4 py-2 text-black hover:bg-gray-700 hover:text-white cursor-pointer border border-black transition-colors text-sm ${
                    isUpdateLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isUpdateLoading}
                >
                  {isUpdateLoading ? (
                    <span className="flex items-center justify-center">
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-black text-sm leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
