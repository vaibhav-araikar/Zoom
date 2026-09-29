import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import ForgotPassword from "./pages/components/ForgotPassword";
import SignUp from "./pages/components/SignUp";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeet";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />}></Route>
          <Route path="/forgot-password" element={<ForgotPassword />}></Route>
          <Route path="/register" element={<SignUp />}></Route>
          <Route path="/:url" element={<VideoMeetComponent />}></Route>
          {/* when we will go to http://localhost:5173/abc the video component page will get opened */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
