import { useState, useImperativeHandle, forwardRef } from "react";

const CommentsModal = forwardRef(
  (
    {
      isOpen,
      onClose,
      post,
      commentOwners,
      currentUser,
      loggedInUser,
      handleUpdateComment,
      handleDeleteComment,
      getColorClass,
      getInitials,
      formatDate,
    },
    ref
  ) => {
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState("");
    const [dropdownOpenId, setDropdownOpenId] = useState(null);

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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Comments</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
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
        <div className="bg-gray-700 rounded-lg p-4">
          {/* Comment Header */}
          <div className="flex justify-between items-baseline mb-2">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-white">
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
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-600 transition-colors"
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
                  <div className="absolute right-0 mt-2 w-32 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          startEditingComment(comment);
                          setDropdownOpenId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id || comment._id);
                          setDropdownOpenId(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment Body */}
          {editingCommentId === comment.id ||
          editingCommentId === comment._id ? (
            <div className="space-y-3 mt-2">
              <textarea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm"
                rows="3"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelEditingComment}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
