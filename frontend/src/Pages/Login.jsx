import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { isLoggedIn } from "../util/authGuard";
import { motion } from "framer-motion";
import FloatingLabelInput from "@/components/custom/FloatingLabelInput";
import { toast } from "sonner";
import { ScrollToTop } from "../util/dom-utils";

const customGoogleButtonStyles = `
    .google-login-custom [role="button"] {
    width: 100% !important;
    height: 72px !important;
    padding: 24px 32px !important;
    font-size: 20px !important;
    font-weight: 600 !important;
    border-radius: 0 !important;
    background: white !important;
    color: black !important;
    border: none !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 16px !important;
  }
  
  .google-login-custom [role="button"]:hover {
    background: #f3f4f6 !important;
  }
  
  /* Ensure Google logo is visible */
  .google-login-custom [role="button"] svg,
  .google-login-custom [role="button"] img {
    width: 24px !important;
    height: 24px !important;
    margin: 0 !important;
    flex-shrink: 0 !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  
  /* Target the text specifically */
  .google-login-custom [role="button"] span {
    color: black !important;
    font-size: 20px !important;
    font-weight: 600 !important;
  }
`;

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
    const styleElement = document.createElement("style");
    styleElement.innerHTML = customGoogleButtonStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl"
        >
          <div className="grid lg:grid-cols-2 gap-0 bg-black/40 backdrop-blur-sm  overflow-hidden shadow-2xl border border-gray-800">
            {/* Left Panel - Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 lg:p-10 flex flex-col justify-center text-white">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="mb-12">
                  <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-none">
                    SKILLY
                  </h1>
                  <div className="w-24 h-2 bg-white  mb-8"></div>
                  <p className="text-xl lg:text-2xl font-light opacity-90 leading-relaxed">
                    Transform your potential into expertise with our
                    revolutionary learning platform
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <span className="text-lg font-medium">
                      Interactive Learning Paths
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <span className="text-lg font-medium">
                      Real-time Progress Tracking
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                    <span className="text-lg font-medium">
                      Expert-led Courses
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <div className="mb-12">
                  <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    Welcome
                    <br />
                    Back
                  </h2>
                  <p className="text-xl text-gray-400">
                    Ready to continue your journey?
                  </p>
                </div>

                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 p-6  mb-8"
                  >
                    <p className="text-red-400 text-lg">{errors.general}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <FloatingLabelInput
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      label="Email Address"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-lg mt-3 ml-2"
                      >
                        {errors.email}
                      </motion.p>
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
                    />
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-lg mt-3 ml-2"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        id="rememberMe"
                        name="rememberMe"
                        type="checkbox"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-6 h-6 text-blue-500 bg-transparent border-2 border-gray-600  focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="ml-4 text-lg text-gray-300 group-hover:text-white transition-colors">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-lg text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-6 px-8 text-2xl font-bold  transition-all duration-300 ${
                      isLoading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                    } text-white`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Signing In...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </motion.button>

                  <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-6 bg-black text-xl text-gray-400">
                        or
                      </span>
                    </div>
                  </div>

                  <motion.div whileTap={{ scale: 0.98 }} className="w-full">
                    <div className="google-login-custom">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => {
                          toast.error("Google login failed");
                          setErrors({
                            general: "Google login failed. Please try again.",
                          });
                        }}
                        text="continue_with"
                        shape="rectangular"
                        size="large"
                        width="100%"
                      />
                    </div>
                  </motion.div>

                  <p className="text-center text-lg text-gray-400 mt-8">
                    New to Skilly?{" "}
                    <button
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      onClick={() => navigate("/register")}
                    >
                      Create Account
                    </button>
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
