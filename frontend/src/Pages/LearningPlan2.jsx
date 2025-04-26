import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LearningPlanCreator from "../Components/LearningPlanCreator2";
import { FileText, Plus, User } from "lucide-react";

const LearningPlan = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Learning Plan Creator
        </div>
        <div className="flex-grow p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
                >
                  <FileText size={18} />
                  My Learning Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
                >
                  <Plus size={18} />
                  Create New Plan
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-700"
                >
                  <User size={18} />
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Dashboard component showing all learning plans
const Dashboard = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/learning-plans");
        if (!response.ok) {
          throw new Error("Failed to fetch learning plans");
        }
        const data = await response.json();
        setPlans(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const deletePlan = async (id) => {
    try {
      const response = await fetch(`/api/learning-plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete learning plan");
      }

      setPlans(plans.filter((plan) => plan._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Learning Plans</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            You haven't created any learning plans yet.
          </p>
          <Link
            to="/create"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
                <p className="text-gray-500 text-sm">
                  Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm">
                  {plan.elements.length} elements
                </p>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
                <Link
                  to={`/edit/${plan._id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit Plan
                </Link>
                <button
                  onClick={() => deletePlan(plan._id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple Profile component
const Profile = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-2xl">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-semibold">User Name</h2>
            <p className="text-gray-500">user@example.com</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Account Statistics</h3>
          <p className="text-gray-600">Learning Plans Created: 5</p>
          <p className="text-gray-600">Account Created: January 1, 2023</p>
        </div>
      </div>
    </div>
  );
};

export default LearningPlan;
