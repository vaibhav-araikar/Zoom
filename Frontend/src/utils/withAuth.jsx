import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // or "next/navigation" for App Router
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
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (!token || !isTokenValid(token)) {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    }, [router]);

    if (isChecking) return null; // or a <Spinner />

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return AuthenticatedComponent;
};

export default withAuth;
