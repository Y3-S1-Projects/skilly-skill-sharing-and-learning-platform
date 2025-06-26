export function formatDateTime(dateString, type = "both") {
  const dateObj = new Date(dateString);

  if (isNaN(dateObj)) return "Invalid Date";

  const optionsDate = { year: "numeric", month: "short", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };

  const date = dateObj.toLocaleDateString(undefined, optionsDate);
  const time = dateObj.toLocaleTimeString(undefined, optionsTime);

  switch (type) {
    case "date":
      return date;
    case "time":
      return time;
    case "both":
    default:
      return `${date} ${time}`;
  }
}
