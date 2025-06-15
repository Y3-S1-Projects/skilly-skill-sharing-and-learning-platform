import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";
import Header from "./Header";
import PostCard from "./PostCard";
import { getUserId } from "../util/auth";

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [usersById, setUsersById] = useState({});
  const [loggedInUserId, setLoggedInUserId] = useState(null);

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

    const fetchLoggedUserId = async () => {
      const id = await getUserId();
      setLoggedInUserId(id);
    };

    fetchLoggedUserId();
    fetchResults();
  }, [searchQuery]);

  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((postWrapper) =>
        postWrapper.post.id === updatedPost.id
          ? { ...postWrapper, post: updatedPost }
          : postWrapper
      )
    );
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts((prevPosts) =>
      prevPosts.filter((postWrapper) => postWrapper.post.id !== deletedPostId)
    );
  };
  console.log(user);

  const renderUserResults = () => {
    if (users.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-700 text-lg font-medium">
            No users found matching "{searchQuery}"
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <img
                src={user.profilePicUrl || "/api/placeholder/80/80"}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border border-gray-300"
              />
              <div className="w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {user.username}
                  {user.id === loggedInUserId && (
                    <span className="text-gray-500 ml-2 text-sm font-normal">
                      (You)
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mb-5 min-h-[20px]">
                  {user?.bio}
                </p>
                <Link
                  to={
                    user.id === loggedInUserId
                      ? "/userprofile"
                      : `/profile/${user.id}`
                  }
                  className="block w-full bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors duration-200 text-sm"
                >
                  View Profile
                </Link>
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
          <p className="text-gray-700">
            No posts found matching "{searchQuery}"
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {posts.map((postWrapper) => {
            const transformedPost = {
              ...postWrapper.post,
              user: {
                username: postWrapper.username,
                profilePicUrl: postWrapper.avatar,
                title: postWrapper.title || "",
              },
            };

            return (
              <div
                key={postWrapper.post.id}
                className="mb-4 break-inside-avoid"
              >
                <PostCard
                  post={transformedPost}
                  currentUser={user}
                  onPostUpdate={handlePostUpdate}
                  onPostDelete={handlePostDelete}
                  isViewingProfile={false}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Search results for "{searchQuery}"
          </h1>
          <p className="text-gray-600 mt-1">
            Found {users.length} users and {posts.length} posts matching your
            search
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "users"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === "posts"
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts ({posts.length})
            </button>
          </nav>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}

        {error && (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Results Content */}
        {!loading && !error && (
          <div className="mt-6">
            {activeTab === "users" ? renderUserResults() : renderPostResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
