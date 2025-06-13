import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Users,
  BookOpen,
  Share2,
  Zap,
  ArrowRight,
  Star,
  Play,
  CheckCircle,
} from "lucide-react";
import Footer from "../Components/Footer";
import LandingHeader from "../Components/Headers/Landingheader";
import { useNavigate } from "react-router-dom";
import AnimatedButton from "@/components/custom/AnimatedButton";

const SkillyLanding = () => {
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, 30]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const skills = [
    {
      name: "Photography",
      learner: "Sarah",
      time: "2 weeks",
      color: "bg-purple-500",
    },
    {
      name: "Cooking",
      learner: "Mike",
      time: "1 month",
      color: "bg-orange-500",
    },
    { name: "Coding", learner: "Alex", time: "3 weeks", color: "bg-blue-500" },
    { name: "Guitar", learner: "Emma", time: "1 week", color: "bg-green-500" },
  ];

  const features = [
    {
      icon: Share2,
      title: "Share Your Journey",
      description:
        "Document your learning process and inspire others with your authentic experience",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Connect with like-minded learners and build a supportive learning network",
    },
    {
      icon: Zap,
      title: "Microlearning Focus",
      description:
        "Break down complex skills into manageable, actionable learning paths",
    },
    {
      icon: BookOpen,
      title: "Authentic Learning",
      description:
        "Real stories from real people, not generic tutorials or courses",
    },
  ];

  const testimonials = [
    {
      name: "Maya Chen",
      skill: "Digital Art",
      quote:
        "I learned watercolor techniques in just 10 days by following Jenny's detailed journey. The personal touch made all the difference!",
      avatar: "MC",
    },
    {
      name: "James Wilson",
      skill: "Baking",
      quote:
        "Skilly helped me discover my passion for sourdough baking. The community support kept me motivated throughout.",
      avatar: "JW",
    },
    {
      name: "Lisa Rodriguez",
      skill: "Language Learning",
      quote:
        "The peer-to-peer approach made learning Spanish fun and engaging. I love sharing my progress too!",
      avatar: "LR",
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
      <LandingHeader />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 sm:px-4 py-2  text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>100% Free Knowledge Sharing</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-roboto font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Learn Skills From
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Real People
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover authentic learning journeys, share your own skills, and
                connect with a community that believes knowledge should be free
                and accessible to everyone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <AnimatedButton
                  label="Start Learning"
                  onClick={() => navigate("/register")}
                  className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg flex items-center justify-center"
                />
              </div>
            </motion.div>

            <motion.div
              style={{ y: y1 }}
              className="relative mt-8 lg:mt-0 px-4 sm:px-0"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative z-10"
              >
                <div className="bg-white   shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 border border-gray-200">
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50  hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${skill.color}  flex items-center justify-center text-white font-bold text-sm sm:text-base`}
                        >
                          {skill.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {skill.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            by {skill.learner} • {skill.time}
                          </p>
                        </div>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating elements - hidden on mobile for cleaner look */}
              <motion.div
                style={{ y: y2 }}
                className="absolute -top-10 -right-10 w-16 h-16 sm:w-20 sm:h-20 bg-purple-200 rounded-full opacity-60 hidden sm:block"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                style={{ y: y1 }}
                className="absolute -bottom-10 -left-10 w-12 h-12 sm:w-16 sm:h-16 bg-indigo-200 rounded-full opacity-60 hidden sm:block"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose Skilly?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Experience learning like never before with our community-driven
              approach to skill sharing
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="text-center p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-purple-500  flex items-center justify-center mx-auto mb-3 sm:mb-4"
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section
        id="community"
        className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Join Our Learning Community
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Real stories from real learners who've transformed their skills
              through our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 sm:p-8  shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                    {testimonial.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      Learned {testimonial.skill}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-8 leading-relaxed">
              Join thousands of learners sharing knowledge for free. No
              subscriptions, no hidden costs.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4  font-semibold text-base sm:text-lg hover:bg-gray-300 transition-colors inline-flex items-center space-x-2 cursor-pointer"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SkillyLanding;
