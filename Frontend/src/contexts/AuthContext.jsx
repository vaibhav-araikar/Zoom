import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { HttpStatusCode } from "axios";

export const AuthContext = createContext(null);

const clientUrl = axios.create({
  baseURL: "http://localhost:5000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const request = await clientUrl.post("/register", {
        name,
        username,
        password,
      });

      if (request.status === HttpStatusCode.Created) {
        return request.data.message;
      }

      return request.data;
    } catch (error) {
      console.log("Registration error:", error);
      throw error;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", {
        username: username,
        password: password,
      });

      if (request.status === HttpStatusCode.Ok) {
        localStorage.setItem("token", request.data.token);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const data = {
    userData,
    setUserData,
    handleRegister,
    router,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

// AuthContext.jsx is a React Context file that stores your application's authentication-related data and functions in one place.
