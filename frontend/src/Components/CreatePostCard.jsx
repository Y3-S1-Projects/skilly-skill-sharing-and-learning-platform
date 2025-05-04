import React from "react";
import { Camera, Calendar, Lightbulb } from "lucide-react";
import { getColorClass, getInitials } from "../util/avatar";

const CreatePostCard = ({ user, setShowCreatePostModal }) => {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-gray-600">
      <div className="p-5">
        <div
          onClick={() => setShowCreatePostModal(true)}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="relative">
            {user?.avatar && !user.avatar.includes("/api/placeholder/") ? (
              <img
                className="h-8 w-8 rounded-full transition-transform duration-300 group-hover:scale-110"
                src={user.avatar}
                alt={user?.name || "User"}
              />
            ) : (
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${getColorClass(
                  user?.id
                )}`}
              >
                {getInitials(user?.name)}
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-green-400 h-3 w-3 rounded-full border-2 border-gray-800 animate-pulse"></div>
          </div>
          <div className="bg-gray-700 rounded-xl px-5 py-3 flex-grow text-gray-300 hover:bg-gray-600 transition-all duration-300 border border-gray-600 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
            <span className="text-indigo-400 font-medium">Share a skill</span>{" "}
            or ask a question, {user.name?.split(" ")[0]}?
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-3 gap-2">
          <PostButton
            icon={
              <Camera className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
            }
            label="Showcase"
            bgColor="bg-gray-700 hover:bg-gray-600"
            textColor="text-purple-400"
            borderColor="border-purple-400"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={
              <Lightbulb className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
            }
            label="Share Skills"
            bgColor="bg-gray-700 hover:bg-gray-600"
            textColor="text-amber-400"
            borderColor="border-amber-400"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={
              <Calendar className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            }
            label="Open to Collab"
            bgColor="bg-gray-700 hover:bg-gray-600"
            textColor="text-emerald-400"
            borderColor="border-emerald-400"
            onClick={() => setShowCreatePostModal(true)}
          />
        </div>
      </div>
    </div>
  );
};

const PostButton = ({
  icon,
  label,
  onClick,
  bgColor,
  textColor,
  borderColor,
}) => (
  <button
    onClick={onClick}
    className={`group flex items-center justify-center space-x-2 text-sm font-medium ${textColor} ${bgColor} rounded-xl px-3 py-2.5 transition-all duration-300 border border-transparent hover:border-${
      borderColor.split("-")[1]
    }-400 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer`}
  >
    {icon}
    <span className="group-hover:font-semibold transition-all">{label}</span>
  </button>
);

export default CreatePostCard;
