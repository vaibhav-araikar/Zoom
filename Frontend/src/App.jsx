import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landing";
import Authentication from "./pages/authentication";
import ForgotPassword from "./pages/components/ForgotPassword";
import SignUp from "./pages/components/SignUp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/register" element={<SignUp />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
