import React from "react";

const server_url = "http://localhost:5173/";

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun.stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  return <div>VideoMeetComponent</div>;
}

// STUN Server = Tumhara public IP aur port bata kar direct P2P connection establish karne mein help karta hai.
