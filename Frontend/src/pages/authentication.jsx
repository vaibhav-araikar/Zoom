import React from "react";
import "./authentication.css";

import Content from "./components/Content";
import SignInCard from "./components/SignIn";

import { AuthContext } from "../contexts/AuthContext";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");

  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        const result = await handleLogin(username, password);

        console.log(result);
      }

      if (formState === 1) {
        const result = await handleRegister(name, username, password);

        console.log(result);

        setUsername("");
        setPassword("");
        setName("");

        setMessage(result);
        setOpen(true);

        setError("");
        setFormState(0);
      }
    } catch (err) {
      console.log(err);

      const message = err.response?.data?.message || "Something went wrong";

      setError(message);
    }
  };

  return (
    <div className="auth-page">
      {/* Background glow */}
      <div className="auth-glow auth-glow-orange"></div>
      <div className="auth-glow auth-glow-purple"></div>
      <div className="auth-glow auth-glow-blue"></div>

      {/* Decorative circles */}
      <div className="auth-circle auth-circle-1"></div>
      <div className="auth-circle auth-circle-2"></div>

      {/* Dot patterns */}
      <div className="auth-dots auth-dots-left"></div>
      <div className="auth-dots auth-dots-right"></div>

      {/* Main content */}
      <main className="auth-container">
        <Content />

        <SignInCard
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          error={error}
          handleAuth={handleAuth}
          formState={formState}
          setFormState={setFormState}
        />
      </main>
    </div>
  );
}
