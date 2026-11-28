import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const clientUrl = axios.create({
  baseURL: "http://localhost:5000/api/v1/users",
});

// Backend se logged in user ki details fetch karna
const getCurrentUser = async (token) => {
  const response = await clientUrl.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user;
};

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [authError, setAuthError] = useState("");

  // User logged in hai ya nahi
  const isAuthenticated = userData !== null;

  // Page refresh hone par user ka login restore karna
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsChecking(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);

        if (!cancelled && localStorage.getItem("token") === token) {
          setUserData(user);
        }
      } catch (error) {
        if (cancelled || localStorage.getItem("token") !== token) {
          return;
        }

        // Invalid token hone par hi token remove karna
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setUserData(null);
        } else {
          setAuthError("Unable to verify login. Please refresh.");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegister = async (name, email, password) => {
    try {
      const response = await clientUrl.post("/register", {
        name,
        username: email,
        password,
      });

      return response.data.message;
    } catch (error) {
      console.error("Registration API error:", error.response?.data);
      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await clientUrl.post("/login", {
        username: email,
        password,
      });

      const token = response.data.token;

      if (!token) {
        throw new Error("Login token not received");
      }

      // Backend se user ki details fetch karna
      const user = await getCurrentUser(token);

      // Token ko localStorage mein save karna
      localStorage.setItem("token", token);

      // User ki details context mein save karna
      setUserData(user);
      setAuthError("");

      return response.data;
    } catch (error) {
      console.error("Login API error:", error.response?.data || error.message);
      throw error;
    }
  };

  // User ko logout karna
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    setAuthError("");
  };

  const getUserHistory = useCallback(async () => {
    try {
      const request = await clientUrl.get("/history", {
        params: {
          token: localStorage.getItem("token"),
        },
      });

      return request.data;
    } catch (error) {
      console.error("Get User History API error:", error.response?.data);
      throw error;
    }
  }, []);

  const addToUserHistory = async (meetingCode) => {
    try {
      const request = await clientUrl.post("/add_to_history", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });

      return request.data;
    } catch (error) {
      console.error("Add to User History API error:", error.response?.data);
      throw error;
    }
  };

  const data = {
    userData,
    setUserData,
    isAuthenticated,
    isChecking,
    authError,
    handleRegister,
    handleLogin,
    handleLogout,
    getUserHistory,
    addToUserHistory,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

// AuthContext.jsx is a React Context file that stores your application's authentication-related data and functions in one place.
