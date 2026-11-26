import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { IconButton } from "@mui/material";
import { Restore } from "@mui/icons-material";

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
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(Home);
