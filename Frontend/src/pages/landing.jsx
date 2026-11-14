import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./landing.css";

const Icon = ({ children }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const features = [
  {
    title: "Face-to-face, instantly",
    text: "Open a room and you're live. No downloads, no waiting around.",
    icon: (
      <>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </>
    ),
  },
  {
    title: "Join with just a code",
    text: "Guests enter a meeting code and hop in. No account needed.",
    icon: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
      </>
    ),
  },
  {
    title: "Any screen you have",
    text: "Phone, tablet or laptop. Your call looks right on all of them.",
    icon: (
      <>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),
  },
];

const steps = [
  { title: "Create a room", text: "Log in and start a call in one click." },
  {
    title: "Share the code",
    text: "Send the meeting code to anyone you like.",
  },
  {
    title: "Start talking",
    text: "They join from any device and you're together.",
  },
];

export default function Landing() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  // Change to match your meeting route
  const joinRoom = (e) => {
    e.preventDefault();
    if (code.trim()) navigate(`/${code.trim()}`);
  };

  return (
    <div className="lnd">
      <header className="lnd-nav">
        <Link to="/" className="lnd-brand">
          <span className="lnd-logo" aria-hidden="true" />
          Air Video Call
        </Link>
        <nav className="lnd-links" aria-label="Main">
          <Link to="/auth" className="lnd-link">
            Log in
          </Link>
          <Link to="/register" className="lnd-cta-sm">
            Register
          </Link>
        </nav>
      </header>

      <main>
        <section className="lnd-hero">
          <div className="lnd-copy">
            <h1>Cover the distance with Air Video Call</h1>
            <p className="lnd-sub">
              Clear, face-to-face calls with the people you miss. Start a room,
              share the code, and you're together.
            </p>

            <div className="lnd-actions">
              <Link to="/auth" className="lnd-btn">
                Get started
              </Link>
              <form className="lnd-join" onSubmit={joinRoom}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter meeting code"
                  aria-label="Meeting code"
                />
                <button type="submit">Join as guest</button>
              </form>
            </div>
          </div>

          <div className="lnd-visual">
            <div className="lnd-orb" aria-hidden="true" />
            <img
              src="/mobile.png"
              alt="Two people on a video call on their phones"
            />

            <div className="lnd-float lnd-float--a">
              <span className="lnd-dot" /> Mom joined the call
            </div>
            <div className="lnd-float lnd-float--b">
              <span className="lnd-ctl">
                <Icon>
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0M12 19v4" />
                </Icon>
              </span>
              <span className="lnd-ctl">
                <Icon>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" />
                </Icon>
              </span>
              <span className="lnd-ctl lnd-ctl--end">
                <Icon>
                  <path d="M18 6 6 18M6 6l12 12" />
                </Icon>
              </span>
            </div>
          </div>
        </section>

        <section className="lnd-section" aria-labelledby="why">
          <h2 id="why">Everything you need to feel close</h2>
          <div className="lnd-cards">
            {features.map((f) => (
              <article key={f.title} className="lnd-card">
                <span className="lnd-icon">
                  <Icon>{f.icon}</Icon>
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lnd-section" aria-labelledby="how">
          <h2 id="how">Your first call in three steps</h2>
          <ol className="lnd-steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="lnd-num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lnd-banner">
          <h2>Someone is waiting to see you</h2>
          <p>Create an account and start your first call today.</p>
          <Link to="/register" className="lnd-btn">
            Create an account
          </Link>
        </section>
      </main>

      <footer className="lnd-footer">
        © {new Date().getFullYear()} Air Video Call
      </footer>
    </div>
  );
}
