import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // npm i jwt-decode

const isTokenValid = (token) => {
  try {
    const { exp } = jwtDecode(token);
    // exp is in seconds, Date.now() is in milliseconds
    return exp * 1000 > Date.now();
  } catch {
    return false; // malformed token
  }
};

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token || !isTokenValid(token)) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      } else {
        setIsChecking(false);
      }
    }, [navigate]);

    if (isChecking) return null; // or a <Spinner />

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default withAuth;
