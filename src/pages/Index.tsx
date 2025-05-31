import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect after auth is determined (not loading)
    if (!loading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // Loading state while determining authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
      <div className="text-center text-white">
        <div className="animate-pulse mb-4">
          <div className="w-16 h-16 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h1 className="text-3xl font-bold">FG Admin</h1>
        <p className="text-lg opacity-80 mt-2">Loading your experience...</p>
      </div>
    </div>
  );
};

export default Index;
