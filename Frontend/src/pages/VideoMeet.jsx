import React, { useEffect, useRef, useState } from "react";
import { Button, TextField } from "@mui/material";
import { io } from "socket.io-client";
import "./VideoMeet.css";

// Backend Socket.IO server
const server_url = "http://localhost:5000";

const connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {
  // =====================================
  // REFS
  // =====================================

  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoRef = useRef(null);

  // Store remote videos
  const videoRef = useRef([]);

  // =====================================
  // STATE
  // =====================================

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  // Local camera/microphone state
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [screenAvailable, setScreenAvailable] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  // Remote video list
  const [videos, setVideos] = useState([]);

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

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Check screen sharing
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
  // SIGNAL MESSAGE FROM SERVER
  // =====================================

  const gotMessageFromServer = (fromId, message) => {
    console.log("Got message from server:", fromId, message);

    // WebRTC signaling will be handled here
    try {
      const signal = JSON.parse(message);

      if (!connections[fromId]) {
        console.log("No connection found for:", fromId);
        return;
      }

      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              return connections[fromId].createAnswer();
            }
          })
          .then((answer) => {
            if (answer) {
              return connections[fromId].setLocalDescription(answer);
            }
          })
          .then(() => {
            if (connections[fromId].localDescription) {
              socketRef.current.emit(
                "signal",
                fromId,
                JSON.stringify({
                  sdp: connections[fromId].localDescription,
                }),
              );
            }
          })
          .catch((error) => {
            console.error("Error handling SDP:", error);
          });
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((error) => {
            console.error("Error adding ICE candidate:", error);
          });
      }
    } catch (error) {
      console.error("Error parsing signal:", error);
    }
  };

  // =====================================
  // CHAT MESSAGE
  // =====================================

  const addMessageToChat = () => {
    console.log("New chat message received");
  };

  // =====================================
  // CREATE PEER CONNECTION
  // =====================================

  const createPeerConnection = (socketListId) => {
    console.log("Creating peer connection for:", socketListId);

    const peerConnection = new RTCPeerConnection(peerConfigConnections);

    connections[socketListId] = peerConnection;

    // =====================================
    // ICE CANDIDATE
    // =====================================

    peerConnection.onicecandidate = (event) => {
      if (event.candidate !== null && socketRef.current) {
        socketRef.current.emit(
          "signal",
          socketListId,
          JSON.stringify({
            ice: event.candidate,
          }),
        );
      }
    };

    // =====================================
    // REMOTE STREAM
    // =====================================

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (!remoteStream) {
        return;
      }

      console.log("Remote stream received:", socketListId);

      const videoExists = videoRef.current.find(
        (video) => video.id === socketListId,
      );

      if (videoExists) {
        const updatedVideos = videoRef.current.map((video) => {
          if (video.id === socketListId) {
            return {
              ...video,
              stream: remoteStream,
            };
          }

          return video;
        });

        videoRef.current = updatedVideos;
        setVideos(updatedVideos);
      } else {
        const newVideo = {
          id: socketListId,
          stream: remoteStream,
          audio: true,
          playsInline: true,
        };

        const updatedVideos = [...videoRef.current, newVideo];

        videoRef.current = updatedVideos;
        setVideos(updatedVideos);
      }
    };

    // =====================================
    // CONNECTION STATE
    // =====================================

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Peer ${socketListId} state:`,
        peerConnection.connectionState,
      );
    };

    // =====================================
    // ADD LOCAL STREAM
    // =====================================

    if (window.localStream !== undefined && window.localStream !== null) {
      connections[socketListId].addStream(window.localStream);
    } else {
      // todo: blacksilence
      // black silence stream for when user has no camera/mic it will send a black screen and silence to other users
      let blackSilence = new MediaStream();
    }

    if (id === socketIRef.current) {
      for (let id2 in connections) {
        if (id2 === socketIdRef.current) continue;

        try {
          connections[id2].addStream(window.localStream);
        } catch (error) {
          console.error("Error adding local stream to peer connection:", error);
        }
        connections[id2]
          .createOffer()
          .then((description) => {
            connections[id2].setLocalDescription(description).then(() => {
              socketRef.current.emit(
                "signal",
                id2,
                JSON.stringify({
                  // sdp = session description protocol, it contains the information about the media capabilities of the peer connection and it is used to establish the connection between peers
                  // we can give any name to the sdp like adp, xyz, but sdp is the standard name for it
                  sdp: connections[id2].localDescription,
                }),
              );
            });
          })
          .catch((error) => {
            console.error("Error creating offer for peer connection:", error);
          });
      }
    }

    return peerConnection;
  };

  // =====================================
  // CONNECT TO SOCKET SERVER
  // =====================================

  const connectToSocketServer = () => {
    console.log("Connecting to Socket.IO server...");

    socketRef.current = io(server_url, {
      transports: ["websocket", "polling"],
    });

    // =====================================
    // SOCKET CONNECT
    // =====================================

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server:", socketRef.current.id);

      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessageToChat);
    });

    // =====================================
    // SIGNAL
    // =====================================

    socketRef.current.on("signal", gotMessageFromServer);

    // =====================================
    // USER JOINED
    // =====================================

    socketRef.current.on("user-joined", async (id, clients) => {
      console.log("User joined:", id, clients);

      for (const socketListId of clients) {
        if (socketListId === socketIdRef.current) {
          continue;
        }

        const peerConnection = createPeerConnection(socketListId);

        try {
          const offer = await peerConnection.createOffer();

          await peerConnection.setLocalDescription(offer);

          socketRef.current.emit(
            "signal",
            socketListId,
            JSON.stringify({
              sdp: peerConnection.localDescription,
            }),
          );
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      }
    });

    // =====================================
    // USER LEFT
    // =====================================

    socketRef.current.on("user-left", (id) => {
      console.log("User left:", id);

      if (connections[id]) {
        connections[id].close();
        delete connections[id];
      }

      const updatedVideos = videoRef.current.filter((video) => video.id !== id);

      videoRef.current = updatedVideos;

      setVideos(updatedVideos);
    });

    // =====================================
    // SOCKET ERROR
    // =====================================

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
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
      }

      // Update tracks on existing peer connections
      Object.keys(connections).forEach((socketListId) => {
        const peerConnection = connections[socketListId];

        if (!peerConnection) {
          return;
        }

        const senders = peerConnection.getSenders();

        stream.getTracks().forEach((track) => {
          const sender = senders.find(
            (sender) => sender.track && sender.track.kind === track.kind,
          );

          if (sender) {
            sender.replaceTrack(track);
          } else {
            peerConnection.addTrack(track, stream);
          }
        });
      });
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  };

  // =====================================
  // REQUEST PERMISSION
  // =====================================

  useEffect(() => {
    getPermission();

    return () => {
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // =====================================
  // UPDATE MEDIA
  // =====================================

  useEffect(() => {
    if (
      video !== undefined &&
      audio !== undefined &&
      videoAvailable &&
      audioAvailable
    ) {
      getUserMedia();
    }
  }, [video, audio, videoAvailable, audioAvailable]);

  // =====================================
  // CONNECT BUTTON
  // =====================================

  const connect = async () => {
    console.log("Connect button clicked");

    if (!username.trim()) {
      alert("Please enter your username");
      return;
    }

    // Make sure camera/mic are available
    if (!window.localStream) {
      await getPermission();
    }

    setVideo(videoAvailable);
    setAudio(audioAvailable);

    // Connect Socket.IO
    connectToSocketServer();

    // Hide lobby
    setAskForUsername(false);
  };

  // =====================================
  // BACK BUTTON
  // =====================================

  const goBack = () => {
    setAskForUsername(true);
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

          {/* Remote videos */}
          <div>
            {videos.map((video) => (
              <div key={video.id}>
                <video
                  autoPlay
                  playsInline
                  ref={(videoElement) => {
                    if (videoElement && video.stream) {
                      videoElement.srcObject = video.stream;
                    }
                  }}
                  style={{
                    width: "400px",
                    height: "300px",
                    backgroundColor: "black",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>

          <br />

          <Button variant="contained" onClick={goBack}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

// Working on webrtc
