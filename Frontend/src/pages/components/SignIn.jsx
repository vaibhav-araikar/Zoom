import { useState } from "react";

export default function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Login submitted");
    console.log("Remember:", rememberMe);
  };

  return (
    <div className="signin-card">
      {/* Card top glow */}
      <div className="card-glow"></div>

      {/* Brand */}
      <div className="card-brand">
        <div className="small-camera-logo">
          <div></div>
        </div>

        <span>
          Air <strong>Video Call</strong>
        </span>
      </div>

      {/* Heading */}
      <div className="signin-heading">
        <div className="welcome-text">WELCOME BACK</div>

        <h2>Sign in</h2>

        <p>Sign in to continue your video conversations.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">Email</label>

          <div className="input-wrapper">
            <span className="input-icon">✉</span>

            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="password">Password</label>

          <div className="input-wrapper">
            <span className="input-icon">🔒</span>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>
        </div>

        {/* Remember + forgot */}
        <div className="options-row">
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <span>Remember me</span>
          </label>

          <a href="#" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        {/* Sign in */}
        <button type="submit" className="signin-button">
          <span>SIGN IN</span>

          <span className="signin-arrow">→</span>
        </button>

        {/* Divider */}
        <div className="divider">
          <span></span>

          <p>or</p>

          <span></span>
        </div>

        {/* Google */}
        <button
          type="button"
          className="social-button"
          onClick={() => console.log("Google login")}
        >
          <span className="google-icon">G</span>

          <span>CONTINUE WITH GOOGLE</span>
        </button>

        {/* Facebook */}
        <button
          type="button"
          className="social-button"
          onClick={() => console.log("Facebook login")}
        >
          <span className="facebook-icon">f</span>

          <span>CONTINUE WITH FACEBOOK</span>
        </button>

        {/* Signup */}
        <div className="signup-text">
          Don't have an account?
          <a href="#" onClick={(e) => e.preventDefault()}>
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
