import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

export default function SignInCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  // Login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await handleLogin(userName, password);

      if (!response?.token) {
        throw new Error("Login token not received");
      }

      console.log("Login successful");
      console.log("Token stored:", !!localStorage.getItem("token"));

      navigate("/home");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-card">
      {/* Purple glow */}
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
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              color: "#ff4d4f",
              fontSize: "14px",
              margin: "10px 0",
            }}
          >
            {error}
          </p>
        )}

        {/* Remember / Forgot */}
        <div className="options-row">
          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />

            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        {/* Sign in */}
        <button type="submit" className="signin-button" disabled={loading}>
          <span className="signin-text">
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </span>

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
          <Link to="/register">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
