import React, { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import "./VideoMeet.css";

const server_url = "http://localhost:5173/";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef(null);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [screenAvailable, setScreenAvailable] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  // =====================================
  // GET PERMISSION
  // =====================================

  const getPermission = async () => {
    try {
      console.log("Requesting camera and microphone permission...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Permission granted");
      console.log("Stream:", stream);

      // Save stream
      window.localStream = stream;

      setVideoAvailable(true);
      setAudioAvailable(true);

      // Show video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Screen sharing
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      }
    } catch (error) {
      console.error("Camera/Microphone permission error:", error);

      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  // =====================================
  // GET USER MEDIA
  // =====================================

  const getUserMedia = async () => {
    try {
      console.log("Getting user media...");

      // Stop previous stream
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: video && videoAvailable,
        audio: audio && audioAvailable,
      });

      console.log("New stream:", stream);

      window.localStream = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        console.log("Video attached successfully");
      } else {
        console.log("Video element not found");
      }
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  };

  // =====================================
  // REQUEST PERMISSION WHEN COMPONENT LOADS
  // =====================================

  useEffect(() => {
    getPermission();
  }, []);

  // =====================================
  // UPDATE MEDIA WHEN VIDEO/AUDIO CHANGES
  // =====================================

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  // =====================================
  // GET MEDIA
  // =====================================

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
  };

  // =====================================
  // CONNECT
  // =====================================

  const connect = () => {
    console.log("Connect button clicked");

    getMedia();

    // Don't hide video for now
    setAskForUsername(false);
  };

  // =====================================
  // COMPONENT
  // =====================================

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter into lobby</h2>

          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "400px",
                height: "300px",
                backgroundColor: "black",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <h2>Welcome {username}</h2>

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "500px",
              height: "350px",
              backgroundColor: "black",
              objectFit: "cover",
            }}
          />

          <br />

          <Button variant="contained" onClick={() => setAskForUsername(true)}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
