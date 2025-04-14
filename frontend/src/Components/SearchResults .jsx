import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";
import Header from "./Header";

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [usersById, setUsersById] = useState({}); // Add this line

  // Get search query from URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") || "";

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch both users and posts at once
        const [usersRes, postsRes] = await Promise.all([
          axios.get(
            `http://localhost:8080/search/users?keyword=${searchQuery}`
          ),
          axios.get(
            `http://localhost:8080/search/posts?keyword=${searchQuery}`
          ),
        ]);

        setUsers(usersRes.data);
        setPosts(postsRes.data);

        const usersMap = usersRes.data.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setUsersById(usersMap);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to fetch search results. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const renderUserResults = () => {
    if (users.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No users found matching "{searchQuery}"
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow p-4 flex items-center border border-gray-100 hover:shadow-md transition-shadow"
          >
            <img
              src={user.avatar || "/api/placeholder/64/64"}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="ml-4">
              <h3 className="font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.title}</p>
              <div className="mt-2">
                <button className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full hover:bg-indigo-100">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPostResults = () => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No posts found matching "{searchQuery}"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((postWrapper) => {
          const post = postWrapper.post;
          const username = postWrapper.username;
          const avatar = postWrapper.avatar;

          const author = usersById[post.userId] || {
            name: username || "Unknown author",
            avatar: avatar || "/api/placeholder/40/40",
            title: "",
          };

          return (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow p-6 border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Author section */}
              <div className="flex items-center mb-4">
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{author.name}</h4>
                  {author.title && (
                    <p className="text-xs text-gray-500">{author.title}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              </div>

              {/* Post content */}
              <h3 className="text-lg font-semibold mb-2">
                {post.title || "Untitled post"}
              </h3>
              <p className="text-gray-600 line-clamp-3">
                {post.content || "No content available"}
              </p>

              {/* Post stats */}
              <div className="mt-4 flex">
                <div className="flex items-center text-gray-500 text-sm mr-4">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {post.comments?.length || 0}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {post.likes.length || 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search results for "{searchQuery}"
          </h1>
          <p className="text-gray-500 mt-1">
            Found {users.length} users and {posts.length} posts matching your
            search
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "posts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts ({posts.length})
            </button>
          </nav>
        </div>

        {/* Loading and error states */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Results content */}
        {!loading && !error && (
          <div className="mt-6">
            {activeTab === "users" ? renderUserResults() : renderPostResults()}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchResults;
