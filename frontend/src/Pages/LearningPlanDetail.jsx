import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import {
  getLearningPlanById,
  updateLearningPlan,
  shareLearningPlan,
} from "../services/learningPlanService";
import CustomLoader from "../Components/CustomLoader";

const LearningPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ id: "", name: "" });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No token found");
          return;
        }

        // Fetch user data
        const userResponse = await fetch(
          "http://localhost:8080/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setUser({
          id: userData.id,
          name: userData.username,
        });

        // Fetch learning plan
        const planData = await getLearningPlanById(id);
        setPlan(planData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPlan();
  }, [id]);

  const handleTopicCompletion = async (topicId, isCompleted) => {
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      topics: plan.topics.map((topic) =>
        topic.id === topicId ? { ...topic, completed: isCompleted } : topic
      ),
    };

    try {
      const result = await updateLearningPlan(plan.id, updatedPlan);
      setPlan(result);
    } catch (err) {
      setError("Failed to update topic: " + err.message);
    }
  };

  const handleResourceCompletion = async (topicId, resourceId, isCompleted) => {
    if (!plan) return;

    const updatedPlan = {
      ...plan,
      topics: plan.topics.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.map((resource) =>
              resource.id === resourceId
                ? { ...resource, completed: isCompleted }
                : resource
            ),
          };
        }
        return topic;
      }),
    };

    try {
      const result = await updateLearningPlan(plan.id, updatedPlan);
      setPlan(result);
    } catch (err) {
      setError("Failed to update resource: " + err.message);
    }
  };

  const handleSharePlan = async () => {
    if (!shareEmail.trim()) {
      setShareError("Please enter an email address");
      return;
    }

    try {
      // In a real app, you would search for the user by email and get their ID
      // For this example, we'll just use a dummy ID
      const dummyUserId = "user-" + Math.floor(Math.random() * 1000);

      await shareLearningPlan(plan.id, [dummyUserId]);
      setShareEmail("");
      setShareError("");
      setShowShareModal(false);
      alert("Learning plan shared successfully!");
    } catch (err) {
      setShareError("Failed to share learning plan: " + err.message);
    }
  };

  const calculateProgress = () => {
    if (!plan || !plan.topics || plan.topics.length === 0) return 0;

    const totalTopics = plan.topics.length;
    const completedTopics = plan.topics.filter(
      (topic) => topic.completed
    ).length;

    return Math.round((completedTopics / totalTopics) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <CustomLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg shadow-md"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <svg
            className="mx-auto h-16 w-16 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLineJoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-gray-400 text-lg">Learning plan not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-6">
          <button
            onClick={() => navigate("/learning-plans")}
            className="flex items-center px-4 py-2 bg-gray-700 shadow-sm rounded-lg text-indigo-300 hover:text-indigo-200 hover:bg-gray-600 transition-all duration-200 border border-gray-600"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Learning Plans
          </button>
        </div>

        <div className="bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-700">
          {/* Header section with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{plan.title}</h1>
                <p className="mt-2 text-indigo-200">
                  Created by {plan.userName} • {formatDate(plan.createdAt)}
                </p>
              </div>

              {plan.userId === user.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/learning-plans/edit/${plan.id}`)}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <span className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 py-2 bg-white text-indigo-600 border border-transparent rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-6">
            {/* Description section */}
            <div className="mb-8 bg-gray-700/50 p-5 rounded-xl border border-gray-700">
              <h2 className="text-lg font-medium text-white mb-3 flex items-center">
                <svg
                  className="h-5 w-5 mr-2 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Description
              </h2>
              <p className="text-gray-300">{plan.description}</p>
            </div>

            {/* Progress section */}
            <div className="mb-8 bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-white flex items-center">
                  <svg
                    className="h-5 w-5 mr-2 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Progress
                </h2>
                <span className="text-lg font-bold text-indigo-400">
                  {calculateProgress()}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Deadline section */}
            {plan.completionDeadline && (
              <div className="mb-8 p-5 bg-amber-900/20 border border-amber-800 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <svg
                    className="h-8 w-8 text-amber-400 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-300">
                      Deadline
                    </h3>
                    <p className="text-amber-200 font-medium">
                      {formatDate(plan.completionDeadline)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Topics section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <svg
                  className="h-6 w-6 mr-2 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Topics
              </h2>

              {plan.topics && plan.topics.length > 0 ? (
                <div className="space-y-6">
                  {plan.topics.map((topic, index) => (
                    <div
                      key={topic.id}
                      className="border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div
                        className={`px-5 py-4 flex items-center justify-between ${
                          topic.completed ? "bg-green-900/20" : "bg-gray-700/50"
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`topic-${topic.id}`}
                            checked={topic.completed}
                            onChange={(e) =>
                              handleTopicCompletion(topic.id, e.target.checked)
                            }
                            className="h-5 w-5 text-indigo-500 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                          />
                          <label
                            htmlFor={`topic-${topic.id}`}
                            className="ml-3 text-lg font-medium text-white"
                          >
                            {index + 1}. {topic.name}
                          </label>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            topic.completed
                              ? "bg-green-900/50 text-green-300"
                              : "bg-gray-600 text-gray-300"
                          }`}
                        >
                          {topic.completed ? "Completed" : "In Progress"}
                        </span>
                      </div>

                      <div className="px-5 py-4 bg-gray-800">
                        {topic.description && (
                          <p className="text-sm text-gray-400 mb-4 italic">
                            {topic.description}
                          </p>
                        )}

                        {topic.resources && topic.resources.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                              <svg
                                className="h-4 w-4 mr-1 text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                              Resources
                            </h3>
                            <ul className="space-y-3">
                              {topic.resources.map((resource) => (
                                <li
                                  key={resource.id}
                                  className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`resource-${resource.id}`}
                                      checked={resource.completed}
                                      onChange={(e) =>
                                        handleResourceCompletion(
                                          topic.id,
                                          resource.id,
                                          e.target.checked
                                        )
                                      }
                                      className="h-4 w-4 text-indigo-500 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                                    />
                                    <div className="ml-3">
                                      <label
                                        htmlFor={`resource-${resource.id}`}
                                        className="text-sm font-medium text-gray-200"
                                      >
                                        {resource.title}
                                      </label>
                                      <div className="flex items-center mt-1">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            resource.type === "article"
                                              ? "bg-blue-900/50 text-blue-300"
                                              : resource.type === "video"
                                              ? "bg-red-900/50 text-red-300"
                                              : resource.type === "book"
                                              ? "bg-purple-900/50 text-purple-300"
                                              : "bg-gray-600 text-gray-300"
                                          }`}
                                        >
                                          {resource.type}
                                        </span>
                                        {resource.completed && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/50 text-green-300">
                                            Completed
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center px-3 py-1.5 bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800 rounded-lg text-sm transition-colors"
                                    >
                                      <svg
                                        className="h-4 w-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                      Open
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-700/50 rounded-xl border border-dashed border-gray-600">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="mt-4 text-gray-400 text-lg">
                    No topics added to this learning plan yet.
                  </p>
                  {plan.userId === user.id && (
                    <button
                      onClick={() =>
                        navigate(`/learning-plans/edit/${plan.id}`)
                      }
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add Topics
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-up border border-gray-700">
              <div className="bg-gray-800 px-6 pt-6 pb-6">
                <div className="flex items-center mb-5">
                  <div className="flex-shrink-0 bg-indigo-900/50 rounded-full p-2">
                    <svg
                      className="h-6 w-6 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg leading-6 font-medium text-white">
                    Share Learning Plan
                  </h3>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="shareEmail"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full rounded-lg border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter email to share with"
                  />
                  {shareError && (
                    <p className="mt-2 text-sm text-red-400">{shareError}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSharePlan}
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }

    .animate-scale-up {
      animation: scaleUp 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `}</style>
    </div>
  );
};

export default LearningPlanDetail;
