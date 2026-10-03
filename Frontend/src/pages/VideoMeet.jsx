import React, { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import "./VideoMeet.css";

const server_url = "http://localhost:5173/";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun.stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  var socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();

  let [showModel, setModel] = useState();
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState();
  let [msg, setMsg] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  //   jab bhi koi guest se login karega tab hum askforusername wala variable use krenge
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState();
  let [videos, setVideos] = useState([]);

  const videoRef = useRef([]);

  // isChrome hum iss liye use kr rhe hai kyuki webrtc sirf chromium based browser ko support krta hai
  // if (isChrome() === false) {
  // }

  const getPermission = async () => {
    try {
      // video permission
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      // audio permission
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      // screen share
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      const userMediaStream = await navigator.mediaDevices
        .getUserMedia({
          video: video,
          audio: audio,
        })
        .then(() => {}) //Todo: get user media success
        .then((stream) => {})
        .catch((err) => {
          console.log("err", err);
        });
    }

    useEffect(() => {
      getPermission();
    }, []);

    useEffect(() => {
      if (video !== undefined && audio !== undefined) {
        getUserMedia();
      }
    }, [video, audio]);

    let getMedia = () => {
      setVideo(videoAvailable);
      setAudio(audioAvailable);
      connectToSocketServer();
    };

    let connect = () => {
      setAskForUsername(false);
      getMedia();
    };

    return (
      <div>
        {askForUsername === true ? (
          <div>
            <h2>Enter into lobby</h2>
            {/* {username} */}
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
              <video ref={localVideoRef} autoPlay muted></video>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };
}
// STUN Server = Tumhara public IP aur port bata kar direct P2P connection establish karne mein help karta hai.
