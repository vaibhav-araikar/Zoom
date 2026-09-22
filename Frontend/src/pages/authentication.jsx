import "./authentication.css";
import Content from "./components/Content";
import SignInCard from "./components/SignIn";

export default function Authentication() {
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
        <SignInCard />
      </main>
    </div>
  );
}
