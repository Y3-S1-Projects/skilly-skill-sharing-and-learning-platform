import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { isLoggedIn } from "../util/authGuard";
import { motion } from "framer-motion";
import FloatingLabelInput from "@/components/custom/FloatingLabelInput";
import { toast } from "sonner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/socialfeed");
    }
  }, [navigate]);

  useEffect(() => {
    // Check if redirected from registration
    if (location.state?.fromRegistration) {
      toast.success("Registration complete!", {
        description: "Please login with your credentials",
        duration: 5000,
        id: "registration-success", // 🚨 Unique ID prevents duplicates
      });

      // Clear the state to prevent showing again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:8080/api/auth/login",
          {
            ...formData,
          }
        );

        // Store token properly
        localStorage.setItem("authToken", response.data.token);

        // Redirect to dashboard
        navigate("/socialfeed");
      } catch (error) {
        console.error("Login failed:", error);
        setErrors({ general: "Login failed. Please check your credentials." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8080/api/auth/google", {
        token: response.credential,
      });

      if (res.data?.token) {
        localStorage.setItem("authToken", res.data.token);
        navigate("/socialfeed");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setErrors({ general: "Google login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGithubLogin = () => {
  //   const redirectUri = encodeURIComponent(
  //     "http://localhost:5173/auth/github/callback"
  //   );
  //   window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email%20read:user`;
  // };
  const handleGithubLogin = () => {
    setIsLoading(true);
    // This will redirect to Spring's OAuth2 endpoint
    window.location.href = "http://localhost:8080/oauth2/authorization/github";
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Logo and branding */}
            <div className="w-full md:w-1/3 bg-gray-900 p-10 flex flex-col justify-center items-center md:items-start">
              <div className="flex items-center mb-8">
                <img
                  src="/skilly-logo-blue-text.png"
                  alt="Skilly Logo"
                  className="h-24 w-24"
                />
                <h1 className="ml-4 text-3xl font-bold text-blue-400">
                  Skilly
                </h1>
              </div>
              <p className="text-gray-300 text-center md:text-left">
                Enhance your skills and track your progress with our
                comprehensive learning platform.
              </p>
            </div>

            {/* Right side - Login form */}
            <div className="w-full md:w-2/3 p-10">
              <div>
                <h2 className="text-center md:text-left text-2xl font-bold text-white mb-6">
                  Sign in to your account
                </h2>
                <p className="text-center md:text-left text-sm text-gray-400 mb-8">
                  Or{" "}
                  <Link
                    to="/register"
                    className="font-medium text-blue-400 hover:text-blue-300"
                  >
                    create a new account
                  </Link>
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-900/50 p-4 rounded-md mb-6">
                  <p className="text-sm text-red-300">{errors.general}</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="relative">
                  <FloatingLabelInput
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    label="Email address"
                    className="mb-4"
                  />

                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-1 text-sm text-red-400"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.email}
                    </motion.div>
                  )}
                </div>
                <div>
                  <FloatingLabelInput
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    label="Password"
                    className="mb-4"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-700 rounded bg-gray-800 focus:ring-2 focus:ring-offset-0 focus:outline-none"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-300 hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
                      isLoading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() =>
                      setErrors({
                        general: "Google login failed. Please try again.",
                      })
                    }
                    useOneTap
                    theme="filled_black"
                    size="large"
                    width="300"
                    text="signin_with"
                    shape="circle"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
