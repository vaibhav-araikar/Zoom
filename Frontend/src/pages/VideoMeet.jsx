import React, { useRef, useState } from "react";
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

  return <div>{askForUsername === true ? <div></div> : <></>}</div>;
}

// STUN Server = Tumhara public IP aur port bata kar direct P2P connection establish karne mein help karta hai.
// Todo: Applying of Inetrnships
