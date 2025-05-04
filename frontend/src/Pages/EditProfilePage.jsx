"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Cropper from "react-easy-crop";
import CustomLoader from "../Components/CustomLoader";

// Function to generate a cropped image from the crop area
const createCroppedImage = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;

  // Create a canvas to draw the cropped image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Wait for image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  // Set canvas dimensions to the cropped area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicUrl: "",
    skills: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [imageHover, setImageHover] = useState(false);

  // Image cropping state
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setInitialLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Authentication required");
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:8080/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;
        setUser(userData);

        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          bio: userData.bio || "",
          profilePicUrl: userData.profilePicUrl || "",
          skills: userData.skills || [],
        });

        if (userData.profilePicUrl) {
          setPreviewUrl(userData.profilePicUrl);
        }

        setError(null);
      } catch (err) {
        setError(
          "Failed to fetch user details: " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error fetching user details:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // component style for circular cropping
  const cropAreaStyle = {
    borderRadius: "50%",
    border: "2px solid #fff",
    boxShadow: "0 0 0 9999em rgba(0, 0, 0, 0.7)",
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.match("image.*")) {
        setError("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // Open the cropper instead of directly setting the image
        setImageToCrop(reader.result);
        setCropperOpen(true);
        // Reset crop and zoom when a new image is loaded
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle crop complete
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Close cropper and clear state
  const handleCancelCrop = () => {
    setCropperOpen(false);
    setImageToCrop(null);
  };

  // Apply crop and generate cropped image
  const handleApplyCrop = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) {
        return;
      }

      const croppedImageBlob = await createCroppedImage(
        imageToCrop,
        croppedAreaPixels
      );

      // Create a File object from the Blob
      const croppedFile = new File([croppedImageBlob], "cropped-profile.jpg", {
        type: "image/jpeg",
      });

      // Generate URL for preview
      const objectUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(objectUrl);
      setCroppedImage(croppedFile);

      // Close the cropper
      setCropperOpen(false);
      setImageToCrop(null);
    } catch (err) {
      console.error("Error creating cropped image:", err);
      setError("Failed to crop image: " + err.message);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Authentication required");
        setLoading(false);
        navigate("/login");
        return;
      }

      let updatedProfileData = { ...formData };

      // If there's a cropped image, upload it
      if (croppedImage) {
        const imgFormData = new FormData();
        imgFormData.append("file", croppedImage);

        try {
          const uploadRes = await axios.post(
            "http://localhost:8080/api/users/upload-profile-pic",
            imgFormData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Update profilePicUrl from the response
          if (uploadRes.data && uploadRes.data.profilePicUrl) {
            updatedProfileData.profilePicUrl = uploadRes.data.profilePicUrl;
          } else {
            console.warn("No profilePicUrl in response:", uploadRes.data);
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          throw new Error(
            "Failed to upload image: " +
              (uploadError.response?.data?.message || uploadError.message)
          );
        }
      }

      // Update the rest of the profile data
      const response = await axios.put(
        "http://localhost:8080/api/users/update",
        updatedProfileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Profile updated successfully");
        setTimeout(() => {
          navigate("/userprofile");
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/userprofile");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen">
        <Header user={user} />
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header user={user} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-300">Edit Profile</h1>
            <p className="mt-1 text-sm text-gray-400">
              Update your profile information and preferences
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Cropper Modal */}
            {cropperOpen && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Crop Profile Picture
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and zoom to adjust your profile picture
                    </p>
                  </div>

                  <div className="relative h-64 w-full">
                    <Cropper
                      image={imageToCrop}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      cropShape="round"
                      showGrid={false}
                      cropAreaStyle={cropAreaStyle}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-sm text-gray-700">Zoom</label>
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      onClick={handleCancelCrop}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleApplyCrop}
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Section */}
              <div>
                <label
                  htmlFor="profilePicture"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Profile Picture
                </label>

                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center">
                    <div
                      className="relative group cursor-pointer"
                      onClick={triggerFileInput}
                      onMouseEnter={() => setImageHover(true)}
                      onMouseLeave={() => setImageHover(false)}
                    >
                      {/* Profile image container */}
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 shadow-md border-4 border-gray-800 flex items-center justify-center">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-16 w-16 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Hover overlay */}
                      <div
                        className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-200 
            ${imageHover ? "opacity-100" : "opacity-0"}`}
                      >
                        <div className="text-white text-sm font-medium">
                          Change Photo
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="mt-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Upload new image
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">
                      Choose a square image in JPG or PNG format.
                    </p>
                    <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                      <li>Recommended size: 400x400 pixels or larger</li>
                      <li>Maximum file size: 5MB</li>
                      <li>
                        You can crop and adjust your image before uploading
                      </li>
                      <li>The image will be displayed as a circle</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white sm:text-sm p-2 border"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white sm:text-sm p-2 border"
                  required
                />
                <p className="mt-1 text-xs text-gray-400">
                  This email will be used for notifications and account recovery
                </p>
              </div>

              {/* Bio Field */}
              <div>
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-300"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  id="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white sm:text-sm p-2 border"
                  placeholder="Tell others about yourself"
                  maxLength={200}
                ></textarea>
                <p className="mt-1 text-xs text-gray-400">
                  Brief description for your profile. Maximum 200 characters.
                </p>
              </div>

              {/* Hidden field */}
              <input
                type="hidden"
                name="profilePicUrl"
                value={formData.profilePicUrl}
              />

              {/* Skills Section */}
              <div>
                <label
                  htmlFor="skills"
                  className="block text-sm font-medium text-gray-300"
                >
                  Skills
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    id="newSkill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., JavaScript, Design)"
                    className="block w-full rounded-l-md bg-gray-700 border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-white sm:text-sm p-2 border"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-indigo-900/50 text-indigo-300 rounded-full px-3 py-1 text-sm border border-indigo-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 text-indigo-400 hover:text-indigo-200 transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Add skills that showcase your expertise
                </p>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
      bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
      focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
      ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
