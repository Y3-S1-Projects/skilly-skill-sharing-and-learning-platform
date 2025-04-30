import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/userprofile"); // Redirect to your main app
    } else {
      navigate("/login?error=no_token");
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Login Successful</h1>
        <p>Redirecting to your profile...</p>
      </div>
    </div>
  );
}
