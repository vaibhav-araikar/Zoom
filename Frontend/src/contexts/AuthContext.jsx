import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

const clientUrl = axios.create({
  baseURL: "http://localhost:5000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const handleRegister = async (name, email, password) => {
    try {
      console.log("Sending to backend:", {
        name,
        email,
        password,
      });

      const response = await clientUrl.post("/register", {
        name,
        username: email,
        password,
      });

      console.log("Backend response:", response.data);

      return response.data.message;
    } catch (error) {
      console.error("Registration API error:", error);
      console.error("Backend error:", error.response?.data);

      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await clientUrl.post("/login", {
        username: email,
        password,
      });

      console.log("Login response:", response.data);

      localStorage.setItem("token", response.data.token);

      return response.data;
    } catch (error) {
      console.error("Login API error:", error);

      throw error;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

// AuthContext.jsx is a React Context file that stores your application's authentication-related data and functions in one place.
