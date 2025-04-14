import React, { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../Components/Header";
const SocialFeed = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        id: 101,
        name: "Jasmine Wong",
        avatar: "/api/placeholder/40/40",
        title: "UX Designer",
        skills: ["UI/UX", "Figma", "Design Thinking"],
      },
      type: "skill_learned",
      content:
        "Just completed my advanced React hooks course! Now I can build much more efficient components.",
      skillName: "React Hooks",
      skillCategory: "Web Development",
      skillLevel: "Advanced",
      completionDate: "2025-03-12",
      likes: 24,
      comments: 7,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "Marcus Johnson",
        avatar: "/api/placeholder/40/40",
        title: "Data Scientist",
        skills: ["Python", "Machine Learning", "Statistics"],
      },
      type: "started_learning",
      content:
        "Starting my journey into Quantum Computing! Any tips from those who&apos;ve ventured into this field before?",
      skillName: "Quantum Computing",
      skillCategory: "Computer Science",
      skillLevel: "Beginner",
      startDate: "2025-03-14",
      resources: ["IBM Quantum Experience", "Qiskit Textbook"],
      likes: 18,
      comments: 12,
      timestamp: "4 hours ago",
    },
    {
      id: 3,
      user: {
        id: 103,
        name: "Elena Rodriguez",
        avatar: "/api/placeholder/40/40",
        title: "Content Creator",
        skills: ["Video Editing", "Creative Writing", "Social Media"],
      },
      type: "achievement",
      content:
        "Just published my first professional video project with the skills I learned here!",
      achievementName: "First Client Project",
      projectLink: "https://example.com/project",
      likes: 42,
      comments: 15,
      timestamp: "1 day ago",
    },
    {
      id: 4,
      user: {
        id: 104,
        name: "Raj Patel",
        avatar: "/api/placeholder/40/40",
        title: "Entrepreneur",
        skills: ["Business Strategy", "Marketing", "Finance"],
      },
      type: "shared_resource",
      content:
        "Found this amazing free course on business model canvas. It helped me structure my startup idea!",
      resourceName: "Business Model Generation Masterclass",
      resourceLink: "https://example.com/course",
      resourceType: "Course",
      likes: 31,
      comments: 8,
      timestamp: "2 days ago",
    },
  ]);

  const [activeFilter, setActiveFilter] = useState("all");

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const filterPosts = (filter) => {
    setActiveFilter(filter);
    // In a real app, this would fetch filtered data from the API
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Header user={user} />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skill Community</h1>
          <p className="text-gray-600 mt-2">
            Discover what others are learning and share your journey
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search skills, people, or topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => filterPosts("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } shadow-sm transition-colors`}
            >
              All
            </button>
            <button
              onClick={() => filterPosts("skills")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === "skills"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } shadow-sm transition-colors`}
            >
              New Skills
            </button>
            <button
              onClick={() => filterPosts("achievements")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === "achievements"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } shadow-sm transition-colors`}
            >
              Achievements
            </button>
            <button
              onClick={() => filterPosts("resources")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeFilter === "resources"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } shadow-sm transition-colors`}
            >
              Resources
            </button>
          </div>
        </div>

        {/* Sharing Box */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <img
              src="/api/placeholder/40/40"
              alt="Your avatar"
              className="rounded-full h-10 w-10"
            />
            <div className="flex-grow">
              <textarea
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="What are you learning today?"
                rows="2"
              ></textarea>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-sm transition-colors">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    <span>Skill</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-sm transition-colors">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Media</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 text-sm transition-colors">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>Progress</span>
                  </button>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-1 text-sm font-medium transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Content */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="rounded-full h-10 w-10"
                  />
                  <div className="flex-grow">
                    <div className="flex items-baseline justify-between">
                      <Link
                        to={`/profile/${post.user.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {post.user.name}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {post.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{post.user.title}</p>
                  </div>
                </div>

                {/* Post Type Badge */}
                <div className="mt-3 flex items-center">
                  {post.type === "skill_learned" && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <svg
                        className="mr-1.5 h-2 w-2 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Learned a new skill
                    </span>
                  )}
                  {post.type === "started_learning" && (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      <svg
                        className="mr-1.5 h-2 w-2 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Started learning
                    </span>
                  )}
                  {post.type === "achievement" && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                      <svg
                        className="mr-1.5 h-2 w-2 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Achievement unlocked
                    </span>
                  )}
                  {post.type === "shared_resource" && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <svg
                        className="mr-1.5 h-2 w-2 text-amber-500"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Shared a resource
                    </span>
                  )}
                </div>

                {/* Post Content */}
                <div className="mt-4">
                  <p className="text-gray-800">{post.content}</p>
                </div>

                {/* Skill or Resource Info */}
                {(post.type === "skill_learned" ||
                  post.type === "started_learning") && (
                  <div className="mt-4 bg-indigo-50 rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-indigo-800">
                          {post.skillName}
                        </h3>
                        <p className="text-sm text-indigo-600">
                          {post.skillCategory}
                        </p>
                      </div>
                      <div className="bg-white rounded-md px-3 py-1 border border-indigo-200 text-indigo-700 text-sm font-medium">
                        {post.skillLevel}
                      </div>
                    </div>
                    {post.type === "started_learning" && post.resources && (
                      <div className="mt-2 pt-2 border-t border-indigo-100">
                        <p className="text-xs text-indigo-700 font-medium mb-1">
                          Learning Resources:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {post.resources.map((resource, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-white text-xs px-2 py-1 rounded-md border border-indigo-200 text-indigo-600"
                            >
                              {resource}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {post.type === "achievement" && post.projectLink && (
                  <div className="mt-4 bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-purple-800">
                        {post.achievementName}
                      </h3>
                      <a
                        href={post.projectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-600"
                      >
                        View Project
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}

                {post.type === "shared_resource" && (
                  <div className="mt-4 bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-amber-800">
                          {post.resourceName}
                        </h3>
                        <p className="text-sm text-amber-700">
                          {post.resourceType}
                        </p>
                      </div>
                      <a
                        href={post.resourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-amber-700 hover:text-amber-600"
                      >
                        Access
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Footer - Interactions */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
                    >
                      <svg
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                      <svg
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.comments}</span>
                    </button>
                  </div>
                  <div>
                    <button className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                      <svg
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-50 font-medium transition-colors">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
