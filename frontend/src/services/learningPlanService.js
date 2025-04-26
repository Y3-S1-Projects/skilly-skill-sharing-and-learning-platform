import axios from "axios";

const API_URL = "http://localhost:8080/api/learning-plans";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Get all learning plans
export const getAllLearningPlans = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching learning plans:", error);
    throw error;
  }
};

// Get learning plans by user ID
export const getLearningPlansByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching learning plans for user ${userId}:`, error);
    throw error;
  }
};

// Get public learning plans
export const getPublicLearningPlans = async () => {
  try {
    const response = await axios.get(`${API_URL}/public`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error fetching public learning plans:", error);
    throw error;
  }
};

// Get shared learning plans
export const getSharedLearningPlans = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/shared/${userId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching shared learning plans for user ${userId}:`, error);
    throw error;
  }
};

// Get learning plan by ID
export const getLearningPlanById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error fetching learning plan ${id}:`, error);
    throw error;
  }
};

// Create a new learning plan
export const createLearningPlan = async (learningPlan) => {
  try {
    const response = await axios.post(API_URL, learningPlan, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error("Error creating learning plan:", error);
    throw error;
  }
};

// Update a learning plan
export const updateLearningPlan = async (id, learningPlan) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, learningPlan, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error updating learning plan ${id}:`, error);
    throw error;
  }
};

// Delete a learning plan
export const deleteLearningPlan = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return true;
  } catch (error) {
    console.error(`Error deleting learning plan ${id}:`, error);
    throw error;
  }
};

// Share a learning plan with other users
export const shareLearningPlan = async (id, userIds) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/share`, userIds, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error sharing learning plan ${id}:`, error);
    throw error;
  }
};