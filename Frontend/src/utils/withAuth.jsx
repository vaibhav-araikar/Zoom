import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, isChecking, authError } = useContext(AuthContext);

    // Authentication check complete hone ka wait karna
    if (isChecking) return null; // or a <Spinner />

    // Server connection mein problem hone par
    if (authError) {
      return <p>{authError}</p>;
    }

    // Agar user logged in nahi hai toh login page par bhejo
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    // Agar user logged in hai toh component show karo
    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default withAuth;
