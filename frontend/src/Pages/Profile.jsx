import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserId, getUserRole, getToken, logout } from "../util/auth";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInfo, setAuthInfo] = useState({ userId: null, role: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if we have a token first
        const token = getToken();
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }

        let role;
        let userId;

        // Try to get user role and handle errors
        try {
          role = await getUserRole();
          console.log("User role:", role);
        } catch (roleError) {
          console.error("Failed to get user role:", roleError);
        }

        // Try to get user ID and handle errors
        try {
          userId = await getUserId();
          console.log("User ID:", userId);
        } catch (idError) {
          console.error("Failed to get user ID:", idError);
          setError("Failed to authenticate user. Please try logging in again.");
          setLoading(false);
          return;
        }

        if (!userId) {
          setError("User ID not found. Please try logging in again.");
          setLoading(false);
          return;
        }

        setAuthInfo({ userId, role });

        // Fetch user details with the userId
        try {
          const response = await axios.get(
            `http://localhost:8080/api/users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUser(response.data);
          if (!user) {
            setError("User not found. Please check your credentials.");
          }
        } catch (fetchError) {
          console.error("Failed to fetch user details:", fetchError);
          setError("Failed to load user profile. Please try again later.");
        }
      } catch (err) {
        console.error("Error in profile:", err);
        setError(err.message || "Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Empty dependency array

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => (window.location.href = "/")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="max-w-md mx-auto mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
  //       <h2 className="text-xl font-bold text-yellow-600 mb-2">
  //         User Not Found
  //       </h2>
  //       <p>We couldn't find your user profile. Please try logging in again.</p>
  //       <button
  //         className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         onClick={() => (window.location.href = "/login")}
  //       >
  //         Go to Login
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="text-center">
        <img
          src={user.profilePicUrl || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-gray-200"
        />
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-gray-600">{user.email}</p>
        {authInfo.role && (
          <p className="text-blue-600 mt-1">Role: {authInfo.role}</p>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Details</h2>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <div className="mt-4 ">
          <button
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            onClick={logout}
          >
            {" "}
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
