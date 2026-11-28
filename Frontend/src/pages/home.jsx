import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import "./home.css";

import {
  VideoCall,
  Add,
  History,
  CalendarMonth,
  Logout,
  Videocam,
  Settings,
  KeyboardArrowDown,
} from "@mui/icons-material";

import {
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import withAuth from "../utils/withAuth";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile menu open aur close karne ke liye
  const [profileMenu, setProfileMenu] = useState(null);

  // Settings dialog open aur close karne ke liye
  const [settingsOpen, setSettingsOpen] = useState(false);

  const meetingInput = useRef(null);

  // let roomId = "123456"; // Replace with actual room ID

  const { userData, addToUserHistory, handleLogout } =
    React.useContext(AuthContext);

  const userName = userData?.name || "User";

  // Join a meeting using meeting code
  const handleJoinVideoCall = async (code) => {
    const validCode = code.trim();

    setError("");

    if (!validCode) {
      setError("Please enter a meeting code");
      return;
    }

    const reservedCodes = [
      "home",
      "auth",
      "login",
      "register",
      "history",
      "forgot-password",
    ];

    if (
      !/^[a-zA-Z0-9_-]+$/.test(validCode) ||
      reservedCodes.includes(validCode.toLowerCase())
    ) {
      setError("Please enter a valid meeting code");
      return;
    }

    setLoading(true);

    try {
      await addToUserHistory(validCode);
      navigate(`/${validCode}`);
    } catch (error) {
      console.error("Status code:", error.response?.status);
      console.error("Backend response :", error.response?.data);
      console.error("Error Message:", error.message);

      setError("Unable to join meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // let handleJoinVideoCall = async () => {
  //   await navigate(`${meetingCode}`);
  // };

  // Generate a unique meeting code
  const handleNewMeeting = () => {
    const newMeetingCode = crypto.randomUUID();

    handleJoinVideoCall(newMeetingCode);
  };

  // Logout the current user
  const logoutUser = () => {
    closeProfileMenu();
    handleLogout();
    navigate("/auth", { replace: true });
  };

  // Profile menu open karna
  const openProfileMenu = (event) => {
    setProfileMenu(event.currentTarget);
  };

  // Profile menu close karna
  const closeProfileMenu = () => {
    setProfileMenu(null);
  };

  // Settings open karna
  const openSettings = () => {
    closeProfileMenu();
    setSettingsOpen(true);
  };

  // Meeting history page par jaana
  const openMeetingHistory = () => {
    closeProfileMenu();
    navigate("/history");
  };

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="dashboard-brand">
          <div className="dashboard-logo">
            <Videocam />
          </div>

          <h2>Air Video Call</h2>
        </div>

        <div className="dashboard-user">
          {/* Profile Button */}
          <button
            type="button"
            className="profile-button"
            onClick={openProfileMenu}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={Boolean(profileMenu)}
          >
            <span className="dashboard-avatar">
              {userName.charAt(0).toUpperCase()}
            </span>

            <span>{userName}</span>

            <KeyboardArrowDown />
          </button>

          {/* Profile Dropdown */}
          <Menu
            anchorEl={profileMenu}
            open={Boolean(profileMenu)}
            onClose={closeProfileMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            {/* User Details */}
            <div className="profile-menu-details">
              <h4>{userName}</h4>
              <p>{userData?.username}</p>
            </div>

            <Divider />

            {/* Settings */}
            <MenuItem onClick={openSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>

            {/* Meeting History */}
            <MenuItem onClick={openMeetingHistory}>
              <ListItemIcon>
                <History fontSize="small" />
              </ListItemIcon>
              Meeting History
            </MenuItem>

            <Divider />

            {/* Logout */}
            <MenuItem onClick={logoutUser} sx={{ color: "#dc2626" }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "#dc2626" }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </div>
      </nav>

      <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-tag">YOUR PERSONAL WORKSPACE</span>

            <h1>Welcome back, {userName}! 👋</h1>

            <p>Connect, collaborate and communicate from anywhere.</p>

            <span className="dashboard-online">
              <span className="online-dot"></span>
              Signed in
            </span>
          </div>

          <img src="/undraw_calling_ieh0.png" alt="Video calling" />
        </section>

        {/* Quick Actions */}
        <h2 className="dashboard-section-title">Quick Actions</h2>

        <section className="dashboard-actions">
          {/* New Meeting */}
          <button
            type="button"
            className="action-card primary-action"
            onClick={handleNewMeeting}
            disabled={loading}
          >
            <VideoCall className="action-icon" />

            <h3>New Meeting</h3>

            <p>Start an instant video call</p>
          </button>

          {/* Join Meeting */}
          <button
            type="button"
            className="action-card"
            onClick={() => meetingInput.current?.focus()}
          >
            <Add className="action-icon" />

            <h3>Join Meeting</h3>

            <p>Connect using a meeting code</p>
          </button>

          {/* Meeting History */}
          <button
            type="button"
            className="action-card"
            onClick={openMeetingHistory}
          >
            <History className="action-icon" />

            <h3>Meeting History</h3>

            <p>Explore your previous calls</p>
          </button>

          {/* Schedule Meeting */}
          <button type="button" className="action-card" disabled>
            <CalendarMonth className="action-icon" />

            <h3>Schedule Meeting</h3>

            <p>Plan your next meeting</p>

            <span className="coming-soon">Coming soon</span>
          </button>
        </section>

        {/* Join Meeting Form */}
        <section className="dashboard-join">
          <h2>Join a meeting</h2>

          <p>Enter the meeting code shared with you.</p>

          <form
            className="dashboard-join-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinVideoCall(meetingCode);
            }}
          >
            <input
              ref={meetingInput}
              type="text"
              value={meetingCode}
              onChange={(e) => {
                setMeetingCode(e.target.value);
                setError("");
              }}
              placeholder="Enter meeting code"
              aria-label="Meeting code"
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Join Meeting"}
            </button>
          </form>

          {error && <p className="dashboard-error">{error}</p>}
        </section>
      </main>

      {/* Account Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Account Settings</DialogTitle>

        <DialogContent>
          <div className="account-settings">
            <label htmlFor="profile-name">Full Name</label>

            <input id="profile-name" type="text" value={userName} readOnly />

            <label htmlFor="profile-email">Email Address</label>

            <input
              id="profile-email"
              type="email"
              value={userData?.username || ""}
              readOnly
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withAuth(HomeComponent);
