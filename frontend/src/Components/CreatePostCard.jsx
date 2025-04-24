import React from "react";
import { Camera, Calendar, FileText, Lightbulb, Share2 } from "lucide-react";

const CreatePostCard = ({ user, setShowCreatePostModal }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-md overflow-hidden mb-6 border border-indigo-100">
      <div className="p-5">
        <div
          onClick={() => setShowCreatePostModal(true)}
          className="flex items-center space-x-4 cursor-pointer"
        >
          <div className="relative">
            <img
              src={user.avatar || "/api/placeholder/80/80"}
              alt={user.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-indigo-300"
            />
            <div className="absolute bottom-0 right-0 bg-green-400 h-3 w-3 rounded-full border-2 border-white"></div>
          </div>
          <div className="bg-white rounded-xl px-5 py-3 flex-grow text-gray-500 hover:bg-gray-50 transition-colors duration-200 border border-indigo-100 shadow-sm">
            <span className="text-indigo-800 font-medium">Share a skill</span>{" "}
            or ask a question, {user.name?.split(" ")[0]}?
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-indigo-100 grid grid-cols-3 gap-2 ">
          <PostButton
            icon={<Camera className="h-5 w-5 text-purple-500" />}
            label="Showcase"
            bgColor="bg-purple-50 hover:bg-purple-100"
            textColor="text-purple-700"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
            label="Share Skills"
            bgColor="bg-amber-50 hover:bg-amber-100"
            textColor="text-amber-700"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={<Calendar className="h-5 w-5 text-emerald-500" />}
            label="Open to Collab"
            bgColor="bg-emerald-50 hover:bg-emerald-100"
            textColor="text-emerald-700"
            onClick={() => setShowCreatePostModal(true)}
          />
        </div>
      </div>
    </div>
  );
};

const PostButton = ({ icon, label, onClick, bgColor, textColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center space-x-2 text-sm font-medium ${textColor} ${bgColor} rounded-xl px-3 py-2.5 transition-all duration-200 border border-transparent hover:border-current cursor-pointer`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default CreatePostCard;
