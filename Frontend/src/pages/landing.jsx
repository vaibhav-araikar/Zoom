import React from "react";
import { Link } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <Link to="/" className="lp-brand" aria-label="Air Video Call home">
          <span className="lp-logo" aria-hidden="true" />
          Air Video Call
        </Link>

        <nav className="lp-links" aria-label="Main">
          {/* Change this route to wherever your guest flow lives */}
          <Link to="/guest" className="lp-link">
            Join as guest
          </Link>
          <Link to="/auth" className="lp-link">
            Log in
          </Link>
          <Link to="/register" className="lp-btn lp-btn--small">
            Register
          </Link>
        </nav>
      </header>

      <main className="lp-hero">
        <div className="lp-copy">
          <h1>Connect with your loved ones, wherever they are</h1>
          <p className="lp-sub">
            Start a video call in a few taps and close the distance between you
            and the people you miss.
          </p>

          <div className="lp-actions">
            <Link to="/auth" className="lp-btn">
              Get started
            </Link>
            <Link to="/guest" className="lp-btn lp-btn--ghost">
              Join as guest
            </Link>
          </div>
        </div>

        <div className="lp-visual">
          <div className="lp-glow" aria-hidden="true" />
          <img src="/mobile.png" alt="Air Video Call running on a phone" />
        </div>
      </main>
    </div>
  );
}
