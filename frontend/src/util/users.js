import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUserDetails = async (userId) => {
  try {
    const token = localStorage.getItem("authToken");
    if (!userId) return null;
    const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("data", response.data);
    return response.data;
  } catch (err) {
    console.error("Error fetching user details:", err);
    throw err;
  }
};
