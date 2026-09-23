import { useState } from "react";
import { Link } from "react-router-dom";
import OutlinedInput from "@mui/material/OutlinedInput";
import Button from "@mui/material/Button";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";

import "./ForgotPassword.css";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("Reset password requested for:", email);

    setSubmitted(true);
  };

  return (
    <div className="forgot-page">
      {/* Background effects */}
      <div className="forgot-glow forgot-glow-orange"></div>
      <div className="forgot-glow forgot-glow-purple"></div>

      <div className="forgot-card">
        {/* Brand */}
        <div className="forgot-brand">
          <div className="small-camera-logo">
            <VideocamRoundedIcon />
          </div>

          <span>
            Air <strong>Video Call</strong>
          </span>
        </div>

        {!submitted ? (
          <>
            {/* Heading */}
            <div className="forgot-heading">
              <div className="welcome-text">ACCOUNT RECOVERY</div>

              <h1>Forgot password?</h1>

              <p>
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="forgot-input-group">
                <label htmlFor="forgot-email">Email address</label>

                <OutlinedInput
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
              </div>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="reset-button"
              >
                SEND RESET LINK
                <span>→</span>
              </Button>
            </form>

            {/* Back */}
            <Link to="/auth" className="back-login">
              ← Back to Sign in
            </Link>
          </>
        ) : (
          /* Success message */
          <div className="reset-success">
            <div className="success-icon">✓</div>

            <h1>Check your email</h1>

            <p>
              If an account exists for <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </p>

            <Link to="/auth" className="back-login-button">
              BACK TO SIGN IN
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
