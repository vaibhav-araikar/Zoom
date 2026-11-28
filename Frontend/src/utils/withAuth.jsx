import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      let cancelled = false;

      const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/auth", { replace: true });
          return;
        }

        try {
          await axios.get("http://localhost:5000/api/v1/users/history", {
            params: { token },
          });

          if (!cancelled) {
            setIsChecking(false);
          }
        } catch (error) {
          if (cancelled) return;

          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/auth", { replace: true });
          } else {
            setError("Unable to verify login. Please refresh.");
          }
        }
      };

      checkAuth();

      return () => {
        cancelled = true;
      };
    }, [navigate]);

    if (error) return <p>{error}</p>;

    if (isChecking) return null;

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default withAuth;
