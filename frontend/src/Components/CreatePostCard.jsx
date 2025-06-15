import React from "react";
import { Camera, Calendar, Lightbulb } from "lucide-react";
import { getColorClass, getInitials } from "../util/avatar";

const CreatePostCard = ({ user, setShowCreatePostModal }) => {
  return (
    <div className="bg-white shadow-sm mb-6 border border-gray-200 hover:shadow-md transition-all duration-300">
      <div className="p-5">
        <div
          onClick={() => setShowCreatePostModal(true)}
          className="flex items-center space-x-4 cursor-pointer group"
        >
          <div className="relative">
            {user?.avatar && !user.avatar.includes("/api/placeholder/") ? (
              <img
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-110 rounded-full"
                src={user.avatar}
                alt={user?.name || "User"}
              />
            ) : (
              <div
                className={`h-8 w-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${getColorClass(
                  user?.id
                )}`}
              >
                {getInitials(user?.name)}
              </div>
            )}
          </div>
          <div className="bg-gray-100 px-5 py-3 flex-grow text-gray-700 hover:bg-gray-200 transition-all duration-300 border border-gray-300">
            <span className="text-black font-medium">Share a skill</span> or ask
            a question, {user.name?.split(" ")[0]}?
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-2">
          <PostButton
            icon={
              <Camera className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
            }
            label="Showcase"
            bgColor="bg-gray-100 hover:bg-gray-200"
            textColor="text-gray-700"
            borderColor="border-gray-400"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={
              <Lightbulb className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
            }
            label="Share Skills"
            bgColor="bg-gray-100 hover:bg-gray-200"
            textColor="text-gray-700"
            borderColor="border-gray-400"
            onClick={() => setShowCreatePostModal(true)}
          />
          <PostButton
            icon={
              <Calendar className="h-5 w-5 text-gray-700 group-hover:scale-110 transition-transform" />
            }
            label="Open to Collab"
            bgColor="bg-gray-100 hover:bg-gray-200"
            textColor="text-gray-700"
            borderColor="border-gray-400"
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
    className={`group flex items-center justify-center space-x-2 text-sm font-medium ${textColor} ${bgColor} px-3 py-2.5 transition-all duration-300 border border-transparent hover:border-gray-400 hover:shadow-sm cursor-pointer`}
  >
    {icon}
    <span className="group-hover:font-semibold transition-all">{label}</span>
  </button>
);

export default CreatePostCard;
