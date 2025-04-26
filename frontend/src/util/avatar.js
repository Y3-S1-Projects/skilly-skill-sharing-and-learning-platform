export const getInitials = (name) => {
  if (!name) return "?";
  const names = name.split(" ");
  let initials = names[0].charAt(0).toUpperCase();
  if (names.length > 1) {
    initials += names[names.length - 1].charAt(0).toUpperCase();
  }
  return initials;
};

export const getColorClass = (userId) => {
  const colors = [
    "bg-blue-200 text-blue-600",
    "bg-green-200 text-green-600",
    "bg-purple-200 text-purple-600",
    "bg-pink-200 text-pink-600",
    "bg-yellow-200 text-yellow-600",
    "bg-indigo-200 text-indigo-600",
  ];
  const index = userId
    ? parseInt(userId.toString().charAt(0), 10) % colors.length
    : 0;
  return colors[index];
};
