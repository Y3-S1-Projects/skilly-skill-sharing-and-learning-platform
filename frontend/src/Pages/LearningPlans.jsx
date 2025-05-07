import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import LearningPlanCard from "../Components/LearningPlans/LearningPlanCard";
import {
  getLearningPlansByUserId,
  getPublicLearningPlans,
  getSharedLearningPlans,
  deleteLearningPlan,
} from "../services/learningPlanService";

const LearningPlans = () => {
  const navigate = useNavigate();
  const [learningPlans, setLearningPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("my-plans");
  const [user, setUser] = useState({
    id: "",
    name: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No token found");
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        setUser({
          id: userData.id,
          name: userData.username,
        });

        await fetchLearningPlans(userData.id, activeTab);
      } catch (err) {
        setError("Failed to fetch user details: " + err.message);
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchLearningPlans = async (userId, tab) => {
    try {
      setLoading(true);
      let plans;

      switch (tab) {
        case "my-plans":
          plans = await getLearningPlansByUserId(userId);
          break;
        case "shared-with-me":
          plans = await getSharedLearningPlans(userId);
          break;
        case "public-plans":
          plans = await getPublicLearningPlans();
          break;
        case "all-plans":
          plans = await getLearningPlansByUserId(userId);
          break;
        case "completed-plans":
          plans = await getLearningPlansByUserId(userId);
          break;
        default:
          plans = await getLearningPlansByUserId(userId);
      }

      setLearningPlans(plans);
      setError(null);
    } catch (err) {
      setError("Failed to fetch learning plans: " + err.message);
      console.error("Error fetching learning plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreatePlan = () => {
    navigate("/learning-plans/create");
  };

  const handleEditPlan = (plan) => {
    navigate(`/learning-plans/edit/${plan.id}`);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this learning plan?")) {
      try {
        await deleteLearningPlan(planId);
        setLearningPlans(learningPlans.filter((plan) => plan.id !== planId));
      } catch (err) {
        setError("Failed to delete learning plan: " + err.message);
      }
    }
  };

  // Helper to filter completed plans
  const getCompletedPlans = (plans) => {
    return plans.filter(
      (plan) =>
        Array.isArray(plan.topics) &&
        plan.topics.length > 0 &&
        plan.topics.every((topic) => topic.completed)
    );
  };

  // Choose which plans to display based on tab
  let displayedPlans = learningPlans;
  if (activeTab === "completed-plans") {
    displayedPlans = getCompletedPlans(learningPlans);
  }

  // Plan stats for summary
  const totalPlans = learningPlans.length;
  const completedPlans = getCompletedPlans(learningPlans).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <svg
                className="h-8 w-8 text-indigo-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              Learning Plans
            </h1>
            <div className="mt-2 text-sm">
              <span className="inline-block bg-gray-700 text-indigo-300 rounded-full px-3 py-1 mr-2">
                Total: <b className="text-white">{totalPlans}</b>
              </span>
              <span className="inline-block bg-gray-700 text-green-300 rounded-full px-3 py-1">
                Completed: <b className="text-white">{completedPlans}</b>
              </span>
            </div>
          </div>
          <button
            onClick={handleCreatePlan}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:scale-105 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center gap-2"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Learning Plan
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 shadow rounded-lg mb-8 border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex -mb-px" aria-label="Tabs">
              {[
                { key: "my-plans", label: "My Plans", icon: "📄" },
                { key: "shared-with-me", label: "Shared With Me", icon: "🤝" },
                { key: "public-plans", label: "Public Plans", icon: "🌍" },
                { key: "all-plans", label: "All Plans", icon: "🗂️" },
                {
                  key: "completed-plans",
                  label: "Completed Plans",
                  icon: "✅",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`w-1/5 py-4 px-1 text-center border-b-2 font-medium text-sm flex flex-col items-center gap-1 transition-all
                ${
                  activeTab === tab.key
                    ? "border-indigo-500 text-indigo-400 bg-gray-700"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600 bg-gray-800"
                }`}
                  style={{ outline: "none" }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="mt-2 text-gray-400 text-lg">
              Loading learning plans...
            </p>
          </div>
        ) : error ? (
          <div
            className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded relative text-center"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : displayedPlans.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="mx-auto mb-4 h-20 w-20 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <p className="text-gray-400 text-xl mb-2">
              {activeTab === "completed-plans"
                ? "No completed learning plans found."
                : "No learning plans found."}
            </p>
            {activeTab === "my-plans" && (
              <button
                onClick={handleCreatePlan}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:scale-105 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg"
              >
                Create Your First Learning Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {displayedPlans.map((plan) => (
              <div
                key={plan.id}
                className="transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200"
              >
                <LearningPlanCard
                  plan={plan}
                  onEdit={activeTab === "my-plans" ? handleEditPlan : null}
                  onDelete={activeTab === "my-plans" ? handleDeletePlan : null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Simple animation for fade-in */}
      <style>{`
    .animate-fade-in {
      animation: fadeIn 0.7s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px);}
      to { opacity: 1; transform: translateY(0);}
    }
  `}</style>
    </div>
  );
};

export default LearningPlans;
