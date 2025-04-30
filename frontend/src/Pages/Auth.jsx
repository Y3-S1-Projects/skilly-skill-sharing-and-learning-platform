import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

function Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/auth/user",
          {
            withCredentials: true,
          }
        );
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleGoogleLogin = () => {
    const state = generateState();
    localStorage.setItem("oauth_state", state);

    // Pass state to Google's client library
    google.accounts.id.prompt(
      (notification) => {
        if (notification.isNotDisplayed() || notification.isSkipped()) {
          // Handle case where One Tap isn't displayed
        }
      },
      { state }
    );
    window.location.href = "/oauth2/authorization/google";
  };

  const handleLogout = async () => {
    await axios.post("/logout", {}, { withCredentials: true });
    setUser(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="auth-container">
      {user ? (
        <div className="user-info">
          <img src={user.picture} alt="Profile" className="profile-image" />
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      ) : (
        <div className="login-options">
          <button onClick={handleGoogleLogin} className="google-login-button">
            Login with Google
          </button>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>
      )}
    </div>
  );
}

export default Auth;
