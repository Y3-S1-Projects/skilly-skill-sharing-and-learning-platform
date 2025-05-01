import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import LearningPlanCard from "../Components/LearningPlans/LearningPlanCard";
import {
  getLearningPlansByUserId,
  getPublicLearningPlans,
  getSharedLearningPlans,
  deleteLearningPlan
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

        const response = await fetch("http://localhost:8080/api/users/details", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
          // Only fetch current user's plans for All Plans tab
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
        setLearningPlans(learningPlans.filter(plan => plan.id !== planId));
      } catch (err) {
        setError("Failed to delete learning plan: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Learning Plans</h1>
          <button
            onClick={handleCreatePlan}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Learning Plan
          </button>
        </div>

        <div className="bg-white shadow rounded-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px" aria-label="Tabs">
              <button
                onClick={() => handleTabChange("my-plans")}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "my-plans"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Plans
              </button>
              <button
                onClick={() => handleTabChange("shared-with-me")}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "shared-with-me"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Shared With Me
              </button>
              <button
                onClick={() => handleTabChange("public-plans")}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "public-plans"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Public Plans
              </button>
              <button
                onClick={() => handleTabChange("all-plans")}
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === "all-plans"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                All Plans
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="spinner"></div>
            <p className="mt-2 text-gray-600">Loading learning plans...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : learningPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No learning plans found.</p>
            {activeTab === "my-plans" && (
              <button
                onClick={handleCreatePlan}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create Your First Learning Plan
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPlans.map(plan => (
              <LearningPlanCard
                key={plan.id}
                plan={plan}
                onEdit={activeTab === "my-plans" ? handleEditPlan : null}
                onDelete={activeTab === "my-plans" ? handleDeletePlan : null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlans;
