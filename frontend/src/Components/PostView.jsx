import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserId } from "../util/auth";
import PostCard from "./PostCard";
import Header from "./Header";
import { ArrowLeft, AlertCircle, Loader } from "lucide-react";

const PostView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [user, setUser] = useState({
    id: "",
    name: "",
    title: "",
    avatar: "",
    coverPhoto: "/api/placeholder/1200/300",
    bio: "",
    location: "",
    joinDate: "",
    stats: {
      followers: 0,
      following: 0,
      skillsLearned: 0,
      skillsInProgress: 0,
      achievements: 0,
    },
    skills: [],
    learningGoals: [],
    certifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user and post in parallel
        const userId = await getUserId();
        const [userResponse, postResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/users/${userId}`),
          axios.get(`http://localhost:8080/api/posts/${id}`),
        ]);

        setUser(userResponse.data);

        // Ensure the post has all required properties
        const postData = {
          ...postResponse.data,
          likes: postResponse.data.likes || [],
          comments: postResponse.data.comments || [],
          sharedBy: postResponse.data.sharedBy || [],
        };
        setPost(postData);

        // Fetch related posts (by same author or same topic)
        if (postData.authorId) {
          const relatedResponse = await axios.get(
            `http://localhost:8080/api/posts?authorId=${postData.authorId}&limit=3&exclude=${id}`
          );
          setRelatedPosts(relatedResponse.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error.response?.status === 404
            ? "Post not found"
            : "Failed to load the post"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    // Show success message
    navigate("/", {
      state: {
        notification: {
          type: "success",
          message: "Post successfully deleted",
        },
      },
    });
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 ">
          <div className="bg-gray-800 border border-red-200 rounded-lg p-6 flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
            <h2 className="text-xl font-semibold text-red-500 mb-2">{error}</h2>
            <p className="text-red-500 mb-4">
              The post you're looking for might have been deleted or doesn't
              exist.
            </p>
            <button
              onClick={goBack}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        {/* Main post container with max width */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <PostCard
              post={post}
              currentUser={user}
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
              isViewingProfile={false}
              isDetailView={true}
            />
          </div>
        </div>

        {/* Related posts section with max width for overall container */}
        {relatedPosts.length > 0 && (
          <div className="mt-8 max-w-6xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              More from this author
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <PostCard
                    post={relatedPost}
                    currentUser={user}
                    isViewingProfile={false}
                    isCompactView={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostView;
