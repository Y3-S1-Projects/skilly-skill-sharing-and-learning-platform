import { useState } from "react";
import axios from "axios";
import {
  X,
  Camera,
  Lightbulb,
  Calendar,
  FileText,
  Video,
  ArrowLeft,
} from "lucide-react";
import Header from "../Components/Header";
import { useNotifications } from "../hooks/useNotifications";
import { ScrollToTop } from "../util/dom-utils";
import { useNavigate } from "react-router-dom";

const CreatePostPage = () => {
  const [postType, setPostType] = useState("text");
  const [mediaType, setMediaType] = useState("images");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 3) {
      setError("You can only upload up to 3 images per post");
      return;
    }

    // Clear any previous errors
    setError("");

    setImages([...images, ...files]);

    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
  };
  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Video file is too large (maximum 50MB)");
      return;
    }

    // Clear any previous errors
    setError("");

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviewImages = [...previewImages];

    newImages.splice(index, 1);
    URL.revokeObjectURL(previewImages[index]);
    newPreviewImages.splice(index, 1);

    setImages(newImages);
    setPreviewImages(newPreviewImages);
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    // Check if there's any content
    if (images.length === 0 && !video && !description.trim()) {
      setError("Please add a description, images, or a video to your post");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("postType", postType);
      formData.append("title", title);
      formData.append("description", description);

      // Add images if any
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Add video if any
      if (video) {
        formData.append("video", video);
      }

      // Get token from localStorage
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        "http://localhost:8080/api/posts",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Reset form on success
      resetForm();

      addNotification({
        title: "Post Created",
        description: "Your post has been created successfully.",
        type: "success",
      });
      navigate("/userprofile");
    } catch (err) {
      setError(
        "Failed to create post: " + (err.response?.data?.message || err.message)
      );
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImages([]);
    setPreviewImages([]);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
    setError("");
  };

  const getPostTypeIcon = () => {
    switch (postType) {
      case "text":
        return <Lightbulb className="h-5 w-5" />;
      case "image":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Calendar className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-300 text-black">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 mt-10 bg-gray-200 border border-black">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button className="p-2 text-black hover:bg-gray-300 border border-black">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              {getPostTypeIcon()}
              <h1 className="text-3xl font-bold">Create New Post</h1>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-black text-red-800">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 p-10">
            {/* Post Type Selection */}
            <div className="space-y-3">
              <label className="text-lg font-semibold block">Post Type</label>
              <div className="relative">
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full p-2 bg-white border border-black text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="text">Text</option>
                  <option value="image">IMAGES</option>
                  <option value="video">VIDEOS</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
              <label htmlFor="title" className="text-lg font-semibold block">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your post"
                className="w-full p-2 bg-white border border-black text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label
                htmlFor="description"
                className="text-lg font-semibold block"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share details about your skill, progress, or learning plan"
                className="w-full p-2 bg-white border border-black text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            {/* Media Type Selection */}
            <div className="space-y-3">
              <label className="text-lg font-semibold block">Media Type</label>
              <div className="relative">
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full p-2 bg-white border border-black text-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="images">Images (max 3)</option>
                  <option value="video">Video (max 50MB)</option>
                </select>
              </div>
            </div>

            {/* Media Upload */}
            {mediaType === "images" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed cursor-pointer bg-white hover:bg-gray-100 border-black transition-colors ${
                      images.length >= 3 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-10 h-10 mb-3 text-gray-600" />
                      <p className="mb-2 text-sm text-black">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, GIF up to 10MB ({images.length}/3)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={images.length >= 3}
                    />
                  </label>
                </div>

                {previewImages.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Preview</label>
                    <div className="grid grid-cols-3 gap-4">
                      {previewImages.map((url, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden border border-black"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 h-6 w-6 bg-red-600 hover:bg-red-700 border border-black rounded-full flex items-center justify-center"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mediaType === "video" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed cursor-pointer bg-white hover:bg-gray-100 border-black transition-colors ${
                      video ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Video className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Upload a video</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        MP4, WebM, max 50MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                      disabled={video !== null}
                    />
                  </label>
                </div>

                {videoPreview && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">
                      Video Preview
                    </label>
                    <div className="relative overflow-hidden border border-black">
                      <video
                        src={videoPreview}
                        controls
                        className="w-full aspect-video"
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 h-6 w-6 bg-red-600 hover:bg-red-700 border border-black rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 border border-gray-600 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-white text-black hover:bg-gray-200 font-semibold border border-black disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Post"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePostPage;
