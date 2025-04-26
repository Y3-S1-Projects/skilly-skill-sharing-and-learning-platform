// frontend/src/Pages/LearningPlanDetail.jsx
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
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading learning plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-gray-600">Learning plan not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/learning-plans")}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Learning Plans
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created by {plan.userName} • {formatDate(plan.createdAt)}
                </p>
              </div>

              {plan.userId === user.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/learning-plans/edit/${plan.id}`)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="px-3 py-1.5 bg-indigo-600 border border-transparent rounded-md text-sm text-white hover:bg-indigo-700"
                  >
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-medium text-gray-900">Progress</h2>
                <span className="text-sm font-medium text-gray-700">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>

            {plan.completionDeadline && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-yellow-800">
                    Deadline: {formatDate(plan.completionDeadline)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics</h2>

              {plan.topics && plan.topics.length > 0 ? (
                <div className="space-y-6">
                  {plan.topics.map((topic, index) => (
                    <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`topic-${topic.id}`}
                            checked={topic.completed}
                            onChange={(e) => handleTopicCompletion(topic.id, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`topic-${topic.id}`} className="ml-2 text-lg font-medium text-gray-900">
                            {index + 1}. {topic.name}
                          </label>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          topic.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {topic.completed ? "Completed" : "In Progress"}
                        </span>
                      </div>

                      <div className="px-4 py-3">
                        {topic.description && (
                          <p className="text-sm text-gray-700 mb-4">{topic.description}</p>
                        )}

                        {topic.resources && topic.resources.length > 0 && (
                          <div className="mt-3">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Resources</h3>
                            <ul className="space-y-2">
                              {topic.resources.map((resource) => (
                                <li key={resource.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`resource-${resource.id}`}
                                      checked={resource.completed}
                                      onChange={(e) => handleResourceCompletion(topic.id, resource.id, e.target.checked)}
                                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-2">
                                      <label htmlFor={`resource-${resource.id}`} className="text-sm font-medium text-gray-900">
                                        {resource.title}
                                      </label>
                                      <p className="text-xs text-gray-500">{resource.type}</p>
                                    </div>
                                  </div>

                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                                    >
                                      Open Link
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
                <p className="text-gray-500 text-center py-4">No topics added to this learning plan yet.</p>
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
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Share Learning Plan
                </h3>

                <div className="mb-4">
                  <label htmlFor="shareEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="shareEmail"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter email to share with"
                  />
                  {shareError && (
                    <p className="mt-1 text-sm text-red-600">{shareError}</p>
                  )}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSharePlan}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPlanDetail;
