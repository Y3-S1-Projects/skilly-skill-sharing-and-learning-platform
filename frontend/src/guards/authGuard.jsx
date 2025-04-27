import { Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    // Show toast notification
    toast.error("Please login to access this page", {
      description: "You need to be logged in to view this content",
    });

    // Redirect to login while preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
