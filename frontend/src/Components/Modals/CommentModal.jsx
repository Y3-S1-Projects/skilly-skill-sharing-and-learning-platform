import { useState } from "react";

// Modal component for displaying comments
const CommentsModal = ({
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
}) => {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id || comment._id);
    setEditCommentContent(comment.content);
  };

  const cancelEditingComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
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

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-64px)]">
          {post.comments && post.comments.length > 0 ? (
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
                    <div className="bg-gray-600 rounded-lg p-3">
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
                            <p className="text-sm font-medium text-gray-300">
                              {commentOwners[comment.userId]?.username ||
                                (comment.userId === currentUser.id
                                  ? currentUser.name
                                  : "User")}
                            </p>
                            <p className="text-xs text-gray-300">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-300 mt-1">
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
          ) : (
            <p className="text-center text-gray-400">No comments yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
