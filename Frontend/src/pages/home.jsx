import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { IconButton, Button, TextField } from "@mui/material";
import { Restore } from "@mui/icons-material";
import withAuth from "../utils/withAuth";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  let roomId = "123456"; // Replace with actual room ID

  let handleJoinVideoCall = async () => {
    await navigate(`${meetingCode}`);
  };

  return (
    <>
      <div className="navBar">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>Air Video Call</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton>
            <Restore />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Calls</h2>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="meeting-code"
                label="Meeting Code"
                placeholder="Enter meeting code"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
              <p>Welcome to our video call service!</p>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img src="undraw_calling_ieh0.png" alt="Calling" />
        </div>
      </div>
    </>
  );
}
export default withAuth(HomeComponent);
