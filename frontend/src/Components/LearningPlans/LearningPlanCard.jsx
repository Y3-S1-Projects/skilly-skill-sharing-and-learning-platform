import React from "react";
import { Link } from "react-router-dom";

const LearningPlanCard = ({ plan, onEdit, onDelete }) => {
  const topicsCount = plan.topics?.length || 0;
  const completedTopics = plan.topics?.filter(topic => topic.completed).length || 0;
  const progress = topicsCount > 0 ? Math.round((completedTopics / topicsCount) * 100) : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(plan)}
                className="text-gray-500 hover:text-indigo-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(plan.id)}
                className="text-gray-500 hover:text-red-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-medium text-gray-700">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div>
            <span className="font-medium">{topicsCount}</span> topics
          </div>
          {plan.completionDeadline && (
            <div>
              Deadline: {formatDate(plan.completionDeadline)}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs text-gray-500">
              Created {formatDate(plan.createdAt)}
            </span>
          </div>
          <Link
            to={`/learning-plans/${plan.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LearningPlanCard;