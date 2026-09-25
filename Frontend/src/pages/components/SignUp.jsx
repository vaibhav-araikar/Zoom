import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

import { GoogleIcon, FacebookIcon } from "./CustomIcons";

import "./SignUp.css";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Clear previous errors
    setNameError("");
    setEmailError("");
    setPasswordError("");

    let isValid = true;

    // Name validation
    if (!name.trim()) {
      setNameError("Name is required.");
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    console.log("Signup submitted:", {
      name,
      email,
      password,
    });
  };

  return (
    <div className="signup-page">
      {/* Background effects */}
      <div className="signup-glow signup-glow-orange"></div>
      <div className="signup-glow signup-glow-purple"></div>
      <div className="signup-glow signup-glow-blue"></div>

      {/* Decorative circles */}
      <div className="signup-circle signup-circle-1"></div>
      <div className="signup-circle signup-circle-2"></div>

      <div className="signup-card">
        {/* Brand */}
        <div className="signup-brand">
          <div className="signup-logo">
            <VideocamRoundedIcon />
          </div>

          <span>
            Air <strong>Video Call</strong>
          </span>
        </div>

        {/* Heading */}
        <div className="signup-heading">
          <div className="signup-small-heading">GET STARTED</div>

          <h1>Create account</h1>

          <p>
            Create your account and start connecting with the people who matter.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="signup-input-group">
            <label htmlFor="name">Full name</label>

            <TextField
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              error={Boolean(nameError)}
              helperText={nameError}
              fullWidth
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="signup-input-group">
            <label htmlFor="email">Email address</label>

            <TextField
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={Boolean(emailError)}
              helperText={emailError}
              fullWidth
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="signup-input-group">
            <label htmlFor="password">Password</label>

            <TextField
              id="password"
              name="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              error={Boolean(passwordError)}
              helperText={passwordError}
              fullWidth
              autoComplete="new-password"
            />
          </div>

          {/* Checkbox */}
          <FormControlLabel
            className="signup-checkbox"
            control={<Checkbox value="allowExtraEmails" />}
            label="I want to receive updates via email."
          />

          {/* Signup button */}
          <Button type="submit" fullWidth className="signup-button">
            <span>CREATE ACCOUNT</span>
            <span className="signup-arrow">→</span>
          </Button>
        </form>

        {/* Divider */}
        <div className="signup-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        {/* Social buttons */}
        <div className="signup-social">
          <button
            type="button"
            className="signup-social-button"
            onClick={() => console.log("Google signup")}
          >
            <GoogleIcon />
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          <button
            type="button"
            className="signup-social-button"
            onClick={() => console.log("Facebook signup")}
          >
            <FacebookIcon />
            <span>CONTINUE WITH FACEBOOK</span>
          </button>
        </div>

        {/* Login */}
        <div className="already-account">
          Already have an account?
          <Link to="/auth">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
