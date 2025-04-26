import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import LearningPlanForm from "../Components/LearningPlans/LearningPlanForm";
import { createLearningPlan } from "../services/learningPlanService";

const CreateLearningPlan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ id: "", name: "" });

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
      } catch (err) {
        setError("Failed to fetch user details: " + err.message);
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const learningPlanData = {
        ...formData,
        userId: user.id,
        userName: user.name,
      };

      await createLearningPlan(learningPlanData);
      navigate("/learning-plans");
    } catch (err) {
      setError("Failed to create learning plan: " + err.message);
      console.error("Error creating learning plan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Create Learning Plan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a structured learning plan with topics, resources, and deadlines
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <LearningPlanForm
              onSubmit={handleSubmit}
              onCancel={() => navigate("/learning-plans")}
              isLoading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLearningPlan;