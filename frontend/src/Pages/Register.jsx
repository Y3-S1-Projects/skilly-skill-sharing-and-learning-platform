import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FloatingLabelInput from "@/components/custom/FloatingLabelInput";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear server error when user makes any change
    if (serverError) {
      setServerError("");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      setServerError("");

      fetch(`${API_BASE_URL}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.firstName + " " + formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })
        .then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            // Handle known error responses from our API
            if (data && data.message) {
              throw new Error(data.message);
            }
            throw new Error("Registration failed. Please try again.");
          }

          return data;
        })
        .then((data) => {
          toast.success("Registration complete!", {
            description: "Please login with your credentials",
            duration: 5000,
            id: "registration-success", // 🚨 Unique ID prevents duplicates
          });
          navigate("/login", { state: { fromRegistration: true } });
        })
        .catch((error) => {
          console.error("Error:", error);

          // Handle email already exists error specifically
          if (error.message.includes("email already")) {
            setErrors({ email: "This email is already registered" });
          } else {
            setServerError(error.message);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left column with logo and branding */}
          <div className="bg-gray-900 p-10 flex flex-col justify-center items-center md:items-start md:w-1/3">
            <div className="flex items-center mb-6">
              <img
                src="/skilly-logo-blue-text.png"
                alt="Skilly Logo"
                className="h-12 w-12"
              />
              <h1 className="ml-3 text-3xl font-bold text-blue-400">Skilly</h1>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-white mb-4">
                Elevate Your Skills
              </h2>
              <p className="text-gray-300 mb-8">
                Join our community of learners and masters. Track your progress,
                connect with mentors, and achieve your goals.
              </p>
              <div className="hidden md:block space-y-4">
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-300">Track progress</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906zm6.5 0C10.17 12.032 9.08 12 8 12c-1.08 0-2.17.032-3.25.094a3 3 0 00-2.025 2.168A6.004 6.004 0 008 18c1.995 0 3.76-.978 4.825-2.738a3 3 0 00-2.025-2.168z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-300">
                    Connect with mentors
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                  </div>
                  <span className="ml-3 text-gray-300">
                    Earn certifications
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column with form */}
          <div className="p-10 md:w-2/3">
            <div>
              <h2 className="text-center md:text-left text-2xl font-extrabold text-white">
                Create your account
              </h2>
              <p className="mt-2 text-center md:text-left text-sm text-gray-400">
                From Learner to Master
              </p>
            </div>

            {serverError && (
              <div className="mt-4 bg-red-900 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-400">{serverError}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                <FloatingLabelInput
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  label="First name"
                />
                <FloatingLabelInput
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  label="Last name"
                />
              </div>

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

              <FloatingLabelInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                label="Password"
                className="mb-4"
              />

              <FloatingLabelInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                label="Confirm Password"
                className="mb-4"
              />

              <div className="flex items-center">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded ${
                    errors.agreeTerms ? "border-red-500" : ""
                  }`}
                />
                <label
                  htmlFor="agreeTerms"
                  className="ml-2 block text-sm text-gray-300"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="mt-1 text-sm text-red-400">{errors.agreeTerms}</p>
              )}

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
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
