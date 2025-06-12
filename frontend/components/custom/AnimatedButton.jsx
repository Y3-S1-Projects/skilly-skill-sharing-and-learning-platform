import { motion, useAnimation } from "framer-motion";
import React from "react";

const AnimatedButton = ({ label = "Sign Up", onClick, className = "" }) => {
  const bgControls = useAnimation();
  const textControls = useAnimation();

  const handleHoverStart = () => {
    bgControls.set({ x: "-100%" });
    bgControls.start({
      x: "0%",
      transition: { duration: 0.3, ease: "easeInOut" },
    });
    textControls.start({
      color: "#ffffff",
      transition: { duration: 0.3, ease: "easeInOut" },
    });
  };

  const handleHoverEnd = () => {
    bgControls
      .start({
        x: "100%",
        transition: { duration: 0.3, ease: "easeInOut" },
      })
      .then(() => {
        bgControls.set({ x: "-100%" });
      });
    textControls.start({
      color: "#4f46e5", // Tailwind indigo-600
      transition: { duration: 0.3, ease: "easeInOut" },
    });
  };

  return (
    <motion.button
      className={`relative overflow-hidden bg-transparent border border-indigo-600 px-6 py-2 transition-colors cursor-pointer ${className}`}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-indigo-600"
        initial={{ x: "-100%" }}
        animate={bgControls}
      />
      <motion.span
        className="relative z-10"
        initial={{ color: "#4f46e5" }}
        animate={textControls}
      >
        {label}
      </motion.span>
    </motion.button>
  );
};

export default AnimatedButton;
