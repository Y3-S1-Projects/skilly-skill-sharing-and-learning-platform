import React from "react";

const CustomLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[9999] backdrop-blur-sm">
      {/* Compact Spinner */}
      <div className="relative w-16 h-16 mb-3">
        {/* Gradient Spinner */}
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animationDuration: "1.2s" }}
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="60, 100"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <p className="text-gray-300 font-medium text-sm mb-1.5">{message}</p>

        {/* Minimal Progress Indicators */}
        <div className="flex justify-center space-x-1.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0"
              style={{
                animation: `pulse 1.2s infinite ${i * 0.15}s`,
                animationTimingFunction: "ease-in-out",
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomLoader;
