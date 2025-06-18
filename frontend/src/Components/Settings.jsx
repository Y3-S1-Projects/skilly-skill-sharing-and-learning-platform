import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Lock,
  Palette,
  User,
  Globe,
  HelpCircle,
  LogOut,
} from "lucide-react";
import useUser from "../hooks/useUser";
import Header from "./Header";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    messages: true,
    skills: true,
    marketing: false,
  });
  const { user } = useUser();
  const toggleNotification = (type) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  console.log(user);

  return (
    <div className="bg-white min-h-screen text-black">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 bg-gray-300 mt-10">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        {/* Profile Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className=" h-16 w-16 rounded-full flex items-center justify-center">
              <img src={user.avatar} className="rounded-full"></img>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{user?.name}</h2>
              <p className="text-gray-600">{user?.bio}</p>
            </div>
            <button className="ml-auto bg-gray-500 px-4 py-2 rounded-md hover:bg-gray-600 transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Settings */}
        <div className="space-y-2">
          {/* Account */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center">
              <User className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Account</h3>
              <ChevronRight className="ml-auto text-gray-500" size={20} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Bell className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Notifications</h3>
            </div>

            <div className="pl-8 space-y-4">
              <div className="flex items-center justify-between">
                <span>Message notifications</span>
                <button
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notifications.messages
                      ? "bg-black justify-end"
                      : "bg-gray-600 justify-start"
                  }`}
                  onClick={() => toggleNotification("messages")}
                >
                  <span className="block w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Skill updates</span>
                <button
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notifications.skills
                      ? "bg-black justify-end"
                      : "bg-gray-600 justify-start"
                  }`}
                  onClick={() => toggleNotification("skills")}
                >
                  <span className="block w-4 h-4 bg-white rounded-full" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span>Marketing emails</span>
                <button
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    notifications.marketing
                      ? "bg-black justify-end"
                      : "bg-gray-600 justify-start"
                  }`}
                  onClick={() => toggleNotification("marketing")}
                >
                  <span className="block w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center">
              <Lock className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Privacy & Security</h3>
              <ChevronRight className="ml-auto text-gray-500" size={20} />
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center">
              <Palette className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Appearance</h3>
              <ChevronRight className="ml-auto text-gray-500" size={20} />
            </div>
          </div>

          {/* Language */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center">
              <Globe className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Language</h3>
              <span className="ml-auto text-gray-400 mr-2">English</span>
              <ChevronRight className="text-gray-500" size={20} />
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-gray-400 rounded-lg p-4">
            <div className="flex items-center">
              <HelpCircle className="text-gray-400" size={20} />
              <h3 className="text-lg font-medium ml-3">Help & Support</h3>
              <ChevronRight className="ml-auto text-gray-500" size={20} />
            </div>
          </div>

          {/* Logout */}
          <div className="bg-gray-400 rounded-lg p-4 mt-6">
            <div className="flex items-center">
              <LogOut className="text-red-600" size={20} />
              <h3 className="text-lg font-medium ml-3 text-red-600">Log Out</h3>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-center mt-8 text-sm">
          Skill Sharing Platform • Version 1.0.4
        </p>
      </div>
    </div>
  );
}
