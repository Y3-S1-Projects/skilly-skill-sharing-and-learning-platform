// frontend/src/Pages/EditLearningPlan.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../Components/Header";
// In EditLearningPlan.jsx
import LearningPlanForm from "../Components/LearningPlans/LearningPlanForm";
import { getLearningPlanById, updateLearningPlan } from "../services/learningPlanService";

const EditLearningPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({ id: "", name: "" });

  useEffect(() => {
    const fetchUserAndPlan = async () => {
      try {
        setLoading(true);
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

        // Check if user is the owner of the plan
        if (planData.userId !== userData.id) {
          navigate(`/learning-plans/${id}`);
          return;
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch data: " + err.message);
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPlan();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      await updateLearningPlan(id, formData);
      navigate(`/learning-plans/${id}`);
    } catch (err) {
      setError("Failed to update learning plan: " + err.message);
      console.error("Error updating learning plan:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading learning plan...</p>
        </div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/learning-plans/${id}`)}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Plan Details
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Learning Plan</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your learning plan details, topics, and resources
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {plan && (
              <LearningPlanForm
                plan={plan}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/learning-plans/${id}`)}
                isLoading={submitting}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLearningPlan;
