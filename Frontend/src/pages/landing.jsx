import React from "react";
import "../App.css";

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
          <p>Register</p>
          <div role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>

      {/* Main Page */}
      <div className="landingMainContainer">
        <div>
          <h1>Connect with your loved ones</h1>
        </div>
        <div></div>
      </div>
    </div>
  );
}
