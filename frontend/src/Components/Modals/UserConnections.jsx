import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";
import { href } from "react-router-dom";

export default function UserConnectionsModal({
  userId,
  isOwnProfile,
  isOpen,
  onClose,
  activeTab: initialActiveTab,
  setActiveTab: setExternalActiveTab,
}) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedQuery, setDisplayedQuery] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  // Sync internal activeTab with external changes
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (setExternalActiveTab) {
      setExternalActiveTab(tab);
    }
  };

  const loadConnections = useCallback(
    async (reset = false) => {
      if (isLoading || (!hasMore && !reset)) return;

      setIsLoading(true);
      const currentPage = reset ? 0 : page;
      const endpoint =
        activeTab === "followers"
          ? `http://localhost:8080/api/users/${userId}/followers`
          : `http://localhost:8080/api/users/${userId}/following`;

      try {
        const response = await fetch(
          `${endpoint}?page=${currentPage}&size=${PAGE_SIZE}&search=${searchQuery}`
        );

        if (!response.ok) throw new Error(`Failed to fetch ${activeTab}`);

        const data = await response.json();

        if (reset) {
          activeTab === "followers" ? setFollowers(data) : setFollowing(data);
        } else {
          activeTab === "followers"
            ? setFollowers((prev) => [...prev, ...data])
            : setFollowing((prev) => [...prev, ...data]);
        }

        setHasMore(data.length === PAGE_SIZE);
        setPage(reset ? 1 : currentPage + 1);
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, isLoading, page, userId, searchQuery, hasMore, PAGE_SIZE]
  );

  const debouncedSearch = useMemo(() => {
    const fn = (value) => {
      setSearchQuery(value);
      setPage(0);
      setHasMore(true);
      loadConnections(true);
    };
    // No delay when clearing search (empty value)
    return debounce(fn, (value) => (value ? 400 : 0));
  }, [loadConnections]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setDisplayedQuery("");
      setPage(0);
      setHasMore(true);
      loadConnections(true);
    }
  }, [isOpen, activeTab, userId]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop <= clientHeight + 50;
    if (isNearBottom && hasMore && !isLoading) {
      loadConnections();
    }
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDisplayedQuery(value);
    debouncedSearch(value);
  };

  const handleClearSearch = () => {
    setDisplayedQuery("");
    setSearchQuery("");
    setPage(0);
    setHasMore(true);
    debouncedSearch.cancel(); // Cancel any pending debounce
    loadConnections(true); // Force immediate reload
  };

  const connections = activeTab === "followers" ? followers : following;
  const connectionText = isOwnProfile
    ? activeTab === "followers"
      ? "Your Followers"
      : "People You Follow"
    : activeTab === "followers"
    ? "Followers"
    : "Following";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/70 backdrop-blur-md"
            onClick={onClose}
          ></div>

          {/* Modal */}
          <div className="relative bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 mx-4 h-[70vh] flex flex-col border border-gray-700">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Connections</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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

              {/* Tabs */}
              <div className="flex gap-8 mb-6">
                <button
                  className={`px-4 py-2 text-medium font-medium transition-colors border-b-2 ${
                    activeTab === "followers"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => handleTabChange("followers")}
                >
                  Followers
                </button>
                <button
                  className={`px-4 py-2 text-medium font-medium transition-colors border-b-2 ${
                    activeTab === "following"
                      ? "border-indigo-500 text-indigo-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => handleTabChange("following")}
                >
                  Following
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={displayedQuery}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 py-3 w-full bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-400"
                />
                {displayedQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-gray-300 px-6 pt-2">
                {connectionText}
              </h3>
              <div
                className="flex-1 overflow-y-auto px-6 pb-6"
                onScroll={handleScroll}
              >
                {connections.length > 0 ? (
                  <div className="space-y-3">
                    {[...connections]
                      .sort((a, b) => {
                        if (a.id === userId) return -1;
                        if (b.id === userId) return 1;
                        const aIsFollowed = following.some(
                          (followedUser) => followedUser.id === a.id
                        );
                        const bIsFollowed = following.some(
                          (followedUser) => followedUser.id === b.id
                        );
                        return bIsFollowed - aIsFollowed;
                      })
                      .map((user) => (
                        <div
                          key={user.id}
                          className="p-3 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                          onClick={() =>
                            (window.location.href = `/profile/${user.id}`)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                user.profilePicUrl ||
                                "https://i.pravatar.cc/150?u=placeholder"
                              }
                              alt={user.username}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                            />
                            <div>
                              <p className="font-semibold text-white">
                                {user.username}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8 text-gray-400">
                    {searchQuery
                      ? "No results found."
                      : activeTab === "followers"
                      ? "No followers yet."
                      : "Not following anyone yet."}
                  </div>
                ) : null}

                {isLoading && (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
