import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  BookOpen,
  Hash,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";
import { getUserId } from "../util/auth";
import Header from "../Components/Header";

const Explore = () => {
  const [selectedFilter, setSelectedFilter] = useState("trending");
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Helper function to estimate read time
  const estimateReadTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(" ").length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserId();
      setLoggedInUserId(userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch user data
          const fetchUser = async () => {
            const response = await axios.get(
              `http://localhost:8080/api/users/${loggedInUserId}`
            );
            setUser({
              ...response.data,
              name: response.data.username,
              avatar: response.data.profilePicUrl,
            });
          };

          // Fetch posts data
          const fetchPosts = async () => {
            const postsResponse = await axios.get(
              `http://localhost:8080/api/posts`
            );
            const postsData = postsResponse.data;

            // Filter out posts from the logged-in user
            const filteredPosts = postsData.filter(
              (post) => post.userId !== loggedInUserId
            );

            const userIds = [
              ...new Set(filteredPosts.map((post) => post.userId)),
            ];

            const userDetailsPromises = userIds.map((id) =>
              axios
                .get(`http://localhost:8080/api/users/${id}`)
                .then((res) => ({ id, ...res.data }))
                .catch(() => ({ id, username: "Unknown", profileImage: null }))
            );

            const usersDetails = await Promise.all(userDetailsPromises);

            const userMap = {};
            usersDetails.forEach((user) => {
              userMap[user.id] = user;
            });

            const postsWithUserDetails = filteredPosts.map((post) => ({
              ...post,
              userDetails: userMap[post.userId] || {},
            }));

            setPosts(postsWithUserDetails);
          };

          // Execute both fetches in parallel
          await Promise.all([fetchUser(), fetchPosts()]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [loggedInUserId]);

  const menuItems = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: BookOpen },
    { id: "popular", label: "Popular", icon: Heart },
    { id: "people", label: "Discover People", icon: Users },
    { id: "topics", label: "Topics", icon: Hash },
  ];

  // Extract unique tags from posts for popular tags
  const popularTags =
    posts.length > 0
      ? [...new Set(posts.flatMap((post) => post.tags || []))]
          .filter((tag) => tag && tag.trim())
          .slice(0, 8)
      : [
          "JavaScript",
          "Design",
          "AI",
          "Psychology",
          "Cooking",
          "Sustainability",
          "React",
          "UI/UX",
        ];

  const filteredPosts = posts.filter(
    (post) =>
      (post.title &&
        post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (post.content &&
        post.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  console.log(posts);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white flex">
        <div className="w-64 border-r-2 border-black p-6 bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">Explore</h2>
            <p className="text-gray-600 text-sm">
              Discover new voices and ideas
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Menu Items */}
          <nav className="mb-8">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setSelectedFilter(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-left border-2 transition-colors ${
                        selectedFilter === item.id
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-black hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Popular Tags */}
          <div>
            <h3 className="font-bold text-black mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-2 py-1 text-xs border border-black bg-white text-black hover:bg-black hover:text-white transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Main Content */}
          <div className="flex-1 p-8">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="flex items-center space-x-3 text-black">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Loading posts...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Filter Bar */}
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-black" />
                    <span className="text-lg font-semibold text-black">
                      {selectedFilter.charAt(0).toUpperCase() +
                        selectedFilter.slice(1)}{" "}
                      Posts
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {filteredPosts.length} posts found
                  </div>
                </div>

                {/* Empty State */}
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-black mb-2">
                      No posts found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No posts available to explore right now"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Posts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          className="border-2 border-black bg-white p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        >
                          {/* Post Header */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-black mb-2 group-hover:underline">
                              {post.title || "Untitled Post"}
                            </h3>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                              {post.content || "No content available"}
                            </p>
                          </div>

                          {/* Tags */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs border border-black bg-white text-black"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="px-2 py-1 text-xs text-gray-500">
                                    +{post.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Author Info */}
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {post.userDetails?.profilePicUrl && (
                                <img
                                  src={post.userDetails.profilePicUrl}
                                  alt={post.userDetails.username}
                                  className="w-8 h-8 border border-black object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-black">
                                  {post.userDetails?.username || "Unknown User"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  @
                                  {post.userDetails?.username?.toLowerCase() ||
                                    "unknown"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {post.createdAt
                                  ? formatTimeAgo(post.createdAt)
                                  : "Unknown time"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {post.content
                                  ? estimateReadTime(post.content)
                                  : "1 min read"}
                              </p>
                            </div>
                          </div>

                          {/* Post Stats */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div
                                onClick={() => handleLike(post.id)}
                                className="flex items-center space-x-1 text-gray-600"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-sm">
                                  {post.likes.length || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-gray-600">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">
                                  {post.comments.length || 0}
                                </span>
                              </div>
                            </div>
                            <button className="flex items-center space-x-1 text-black hover:bg-black hover:text-white px-3 py-1 border border-black transition-colors">
                              <span className="text-sm font-medium">
                                Read More
                              </span>
                              <Share2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Hover Effect Content */}
                          <div className="hidden mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 italic">
                              Click to read the full post and join the
                              conversation
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    <div className="mt-12 text-center">
                      <button className="px-8 py-3 border-2 border-black bg-white text-black font-semibold hover:bg-black hover:text-white transition-colors">
                        Load More Posts
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Explore;
