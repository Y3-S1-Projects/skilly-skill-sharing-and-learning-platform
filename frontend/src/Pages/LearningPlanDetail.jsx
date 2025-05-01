import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import { getLearningPlanById, updateLearningPlan, shareLearningPlan } from "../services/learningPlanService";

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
        const userResponse = await fetch("http://localhost:8080/api/users/details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      topics: plan.topics.map(topic =>
        topic.id === topicId ? { ...topic, completed: isCompleted } : topic
      )
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
      topics: plan.topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.map(resource =>
              resource.id === resourceId ? { ...resource, completed: isCompleted } : resource
            )
          };
        }
        return topic;
      })
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
    const completedTopics = plan.topics.filter(topic => topic.completed).length;

    return Math.round((completedTopics / totalTopics) * 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="mt-2 text-gray-600 text-lg">Loading learning plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <svg className="mx-auto h-16 w-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-600 text-lg">Learning plan not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-6">
          <button
            onClick={() => navigate("/learning-plans")}
            className="flex items-center px-4 py-2 bg-white shadow-sm rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-all duration-200"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Learning Plans
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-indigo-100">
          {/* Header section with gradient background */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{plan.title}</h1>
                <p className="mt-2 text-indigo-100">
                  Created by {plan.userName} • {formatDate(plan.createdAt)}
                </p>
              </div>

              {plan.userId === user.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/learning-plans/edit/${plan.id}`)}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white hover:bg-white/30 transition-colors"
                  >
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </span>
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-4 py-2 bg-white text-indigo-600 border border-transparent rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
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
            <div className="mb-8 bg-indigo-50 p-5 rounded-xl">
              <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Description
              </h2>
              <p className="text-gray-700">{plan.description}</p>
            </div>

            {/* Progress section */}
            <div className="mb-8 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Progress
                </h2>
                <span className="text-lg font-bold text-indigo-600">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* Deadline section */}
            {plan.completionDeadline && (
              <div className="mb-8 p-5 bg-amber-50 border border-amber-100 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <svg className="h-8 w-8 text-amber-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800">Deadline</h3>
                    <p className="text-amber-900 font-medium">
                      {formatDate(plan.completionDeadline)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Topics section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="h-6 w-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Topics
              </h2>

              {plan.topics && plan.topics.length > 0 ? (
                <div className="space-y-6">
                  {plan.topics.map((topic, index) => (
                    <div key={topic.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className={`px-5 py-4 flex items-center justify-between ${topic.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`topic-${topic.id}`}
                            checked={topic.completed}
                            onChange={(e) => handleTopicCompletion(topic.id, e.target.checked)}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`topic-${topic.id}`} className="ml-3 text-lg font-medium text-gray-900">
                            {index + 1}. {topic.name}
                          </label>
                        </div>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          topic.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {topic.completed ? "Completed" : "In Progress"}
                        </span>
                      </div>

                      <div className="px-5 py-4">
                        {topic.description && (
                          <p className="text-sm text-gray-700 mb-4 italic">{topic.description}</p>
                        )}

                        {topic.resources && topic.resources.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                              <svg className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              Resources
                            </h3>
                            <ul className="space-y-3">
                              {topic.resources.map((resource) => (
                                <li key={resource.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`resource-${resource.id}`}
                                      checked={resource.completed}
                                      onChange={(e) => handleResourceCompletion(topic.id, resource.id, e.target.checked)}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-3">
                                      <label htmlFor={`resource-${resource.id}`} className="text-sm font-medium text-gray-900">
                                        {resource.title}
                                      </label>
                                      <div className="flex items-center mt-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                          resource.type === 'article' ? 'bg-blue-100 text-blue-800' :
                                          resource.type === 'video' ? 'bg-red-100 text-red-800' :
                                          resource.type === 'book' ? 'bg-purple-100 text-purple-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {resource.type}
                                        </span>
                                        {resource.completed && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
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
                                      className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-gray-500 text-lg">No topics added to this learning plan yet.</p>
                  {plan.userId === user.id && (
                    <button
                      onClick={() => navigate(`/learning-plans/edit/${plan.id}`)}
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
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-scale-up">
              <div className="bg-white px-6 pt-6 pb-6">
                <div className="flex items-center mb-5">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                    Share Learning Plan
                  </h3>
                </div>

                <div className="mb-6">
                  <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter email to share with"
                  />
                  {shareError && (
                    <p className="mt-2 text-sm text-red-600">{shareError}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
