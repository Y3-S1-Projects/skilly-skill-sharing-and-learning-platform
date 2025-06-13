import AnimatedButton from "@/components/custom/AnimatedButton";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const textControls = useAnimation();
  const bgControls = useAnimation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleHoverStart = () => {
    // Reset background to left before entry
    bgControls.set({ x: "-100%" });

    // Animate background to center
    bgControls.start({
      x: "0%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    });

    // Animate text color to white
    textControls.start({
      color: "#ffffff",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    });
  };

  const handleHoverEnd = () => {
    // Animate background to right
    bgControls
      .start({
        x: "100%",
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      })
      .then(() => {
        // Reset background to left after exit
        bgControls.set({ x: "-100%" });
      });

    // Animate text color back to indigo
    textControls.start({
      color: "#4f46e5", // Tailwind's indigo-600
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
              <img src="/skilly-new.png" alt="Skilly Logo" />
            </div>
            <span className="text-3xl text-gray-800">Skilly</span>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {[
              { id: "features", label: "Features" },
              { id: "community", label: "Community" },
              { id: "about", label: "About" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="relative overflow-hidden inline-block group"
              >
                <span className="block text-gray-600 text-2xl transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                  {item.label}
                </span>
                <span className="absolute top-full left-0 w-full text-indigo-600 text-2xl font-medium transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
          {/* Desktop Get Started Button */}
          <AnimatedButton
            label="Login"
            onClick={() => navigate("/login")}
            className="hidden md:block  items-center justify-center text-3xl"
          />{" "}
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
            aria-label="Toggle mobile menu"
          >
            <motion.span
              animate={
                isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }
              }
              className="w-6 h-0.5 bg-gray-800 block transition-all duration-300"
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-6 h-0.5 bg-gray-800 block transition-all duration-300"
            />
            <motion.span
              animate={
                isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
              }
              className="w-6 h-0.5 bg-gray-800 block transition-all duration-300"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-2xl md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {/* <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center">
                    <img src="/skilly-logo-blue-text.png" alt="Skilly Logo" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">
                    Skilly
                  </span>
                </div> */}
                <button
                  onClick={closeMobileMenu}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 px-6 py-8">
                <nav className="space-y-8">
                  <motion.a
                    href="#features"
                    onClick={closeMobileMenu}
                    className="block text-4xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Features
                  </motion.a>
                  <motion.a
                    href="#community"
                    onClick={closeMobileMenu}
                    className="block text-4xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Community
                  </motion.a>
                  <motion.a
                    href="#about"
                    onClick={closeMobileMenu}
                    className="block text-4xl font-semibold text-gray-800 hover:text-indigo-600 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    About
                  </motion.a>
                </nav>
              </div>

              {/* Mobile Get Started Button */}
              <div className="p-6 border-t border-gray-200">
                <motion.button
                  onClick={() => navigate("/register")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-transparent border border-indigo-600 text-indigo-600 text-xl font-semibold px-8 py-4  transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Login
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingHeader;
