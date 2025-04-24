import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Camera, Lightbulb, Calendar, FileText, Share2 } from "lucide-react";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [postType, setPostType] = useState("skill"); // skill, progress, plan
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 3) {
      setError("You can only upload up to 3 images per post");
      return;
    }

    setImages([...images, ...files]);

    const newPreviewImages = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewImages]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("postType", postType);
      formData.append("title", title);
      formData.append("description", description);
      images.forEach((image) => {
        formData.append("images", image);
      });

      const token = localStorage.getItem("authToken");

      await axios.post("http://localhost:8080/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setTitle("");
      setDescription("");
      setImages([]);
      setPreviewImages([]);
      onClose();
    } catch (err) {
      setError(
        "Failed to create post: " + (err.response?.data?.message || err.message)
      );
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPostTypeIcon = () => {
    switch (postType) {
      case "skill":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case "progress":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "plan":
        return <Calendar className="h-5 w-5 text-emerald-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
    }
  };

  const getPostTypeColor = () => {
    switch (postType) {
      case "skill":
        return "from-amber-50 to-amber-100 border-amber-200";
      case "progress":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "plan":
        return "from-emerald-50 to-emerald-100 border-emerald-200";
      default:
        return "from-amber-50 to-amber-100 border-amber-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl border-0 shadow-xl">
        <DialogHeader
          className={`rounded-t-xl bg-gradient-to-r ${getPostTypeColor()} p-4 -m-6 mb-2`}
        >
          <div className="flex items-center gap-2 mb-1">
            {getPostTypeIcon()}
            <DialogTitle className="text-xl font-bold">
              Share Your Knowledge
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-700">
            Connect, collaborate, and grow with the community
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert
            variant="destructive"
            className="bg-red-50 border border-red-200 text-red-800"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Post Type</Label>
            <Tabs
              value={postType}
              onValueChange={setPostType}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="skill"
                  className="rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>Skill Sharing</span>
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className="rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
                >
                  <FileText className="h-4 w-4" />
                  <span>Learning Progress</span>
                </TabsTrigger>
                <TabsTrigger
                  value="plan"
                  className="rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Learning Plan</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content container with fixed height */}
          <div className="min-h-96">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-700 font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your post"
                  className="rounded-xl border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details about your skill, progress, or learning plan"
                  className="rounded-xl border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">
                  Upload Images (max 3)
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-8 h-8 mb-2 text-indigo-500" />
                      <p className="mb-1 text-sm text-gray-700">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {previewImages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Preview</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {previewImages.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-indigo-100"
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <Button
                          type="button"
                          onClick={() => removeImage(index)}
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-800 bg-opacity-60 hover:bg-opacity-80 border-0"
                        >
                          <X className="h-4 w-4 text-white" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {postType === "progress" && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Progress Template
                  </Label>
                  <Select defaultValue="course">
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="course">Completed Course</SelectItem>
                      <SelectItem value="milestone">
                        Reached Milestone
                      </SelectItem>
                      <SelectItem value="skill">New Skill Learned</SelectItem>
                      <SelectItem value="challenge">
                        Completed Challenge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {postType === "plan" && (
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">
                    Estimated Completion Time
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      className="w-20 rounded-xl border-gray-200"
                      placeholder="1"
                    />
                    <Select defaultValue="days">
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="weeks">Weeks</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`rounded-xl ${
                postType === "skill"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : postType === "progress"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {loading ? "Creating..." : "Share with Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
