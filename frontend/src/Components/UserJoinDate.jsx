import { CalendarDays } from "lucide-react";

export default function UserJoinDate({ user, isPublic = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC", // Prevents timezone shifting
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center mt-6 mb-8">
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 bg-gray-600 rounded-full shadow-sm">
        <CalendarDays size={16} className="text-white" />
        <span>
          Member since{" "}
          {formatDate(isPublic ? user.registrationDate : user.joinDate)}
        </span>
      </div>
    </div>
  );
}
