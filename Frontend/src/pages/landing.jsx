import React from "react";
import "../App.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      {/* Navbar */}
      <nav>
        <div className="navHeader">
          <h2>Air Video Call</h2>
        </div>

        <div className="navList">
          <p>Join as Guest</p>

          <Link
            to="/register"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p>Register</p>
          </Link>

          <Link to="/auth" style={{ textDecoration: "none", color: "inherit" }}>
            <p>Login</p>
          </Link>
        </div>
      </nav>

      {/* Main Page */}
      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#ff9839" }}>Connect</span> with your loved
            ones
          </h1>
          <p>Cover a distance by Air Video Call</p>
          <div role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="Mobile PNG" />
        </div>
      </div>
    </div>
  );
}
