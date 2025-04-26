// GitHubCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const GitHubCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGitHubCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");

      if (!code) {
        setError("No authorization code found in the URL");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/github",
          { code }
        );

        if (response.data && response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          navigate("/profile"); // Redirect to profile page after successful login
        } else {
          setError("Failed to obtain token from server");
        }
      } catch (err) {
        console.error("GitHub authentication error:", err);
        setError("Authentication failed. Please try again.");
      }
    };

    handleGitHubCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">GitHub Authentication</h2>
        {error ? (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Authenticating with GitHub...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubCallback;
