import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextField, Badge, Avatar } from "@mui/material";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";

// Improve audio quality by enabling echo cancellation, noise suppression, and auto gain control
const audioConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  channelCount: 1,
};

// Backend Socket.IO server
const server_url = "http://localhost:5000";

const connections = {};

// ICE candidates that arrive before the remote description is set
const pendingIce = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

// helper that adds local tracks with addTrack (addStream is deprecated)
const addLocalTracks = (peerConnection) => {
  if (!window.localStream) return;

  const senders = peerConnection.getSenders();

  window.localStream.getTracks().forEach((track) => {
    const alreadyAdded = senders.some((s) => s.track === track);
    if (!alreadyAdded) {
      peerConnection.addTrack(track, window.localStream);
    }
  });
};

// format a Date as e.g. "10:42 PM"
const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function VideoMeetComponent() {
  // =====================================
  // REFS
  // =====================================

  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoRef = useRef(null);

  // Store remote videos
  const videoRef = useRef([]);

  // chat refs
  const chatEndRef = useRef(null);
  const showModalRef = useRef(true);

  // =====================================
  // STATE
  // =====================================

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);

  // Local camera/microphone state
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [screenAvailable, setScreenAvailable] = useState(false);
  const [screen, setScreen] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  // Optional: put your profile picture URL here (or load it from your user data).
  // If it is empty, a demo "user" avatar is shown automatically.
  const [profilePic, setProfilePic] = useState("");

  const [newMessages, setNewMessages] = useState(0);
  const [showModal, setShowModal] = useState(true);

  // chat
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

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

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    // signal can arrive before the connection exists -> would crash
    if (!connections[fromId]) return;

    // matlab from id mai nahi huuu
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            // apply ICE candidates that arrived early
            (pendingIce[fromId] || []).forEach((candidate) =>
              connections[fromId]
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch((e) => console.log(e)),
            );
            pendingIce[fromId] = [];

            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((e) => console.log(e));
                })
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => console.log(e));
      }

      if (signal.ice) {
        // queue the candidate until the remote description exists
        if (
          connections[fromId].remoteDescription &&
          connections[fromId].remoteDescription.type
        ) {
          connections[fromId]
            .addIceCandidate(new RTCIceCandidate(signal.ice))
            .catch((e) => console.log(e));
        } else {
          pendingIce[fromId] = pendingIce[fromId] || [];
          pendingIce[fromId].push(signal.ice);
        }
      }
    }
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      addLocalTracks(connections[id]);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    // abhi jop bhi track tha hamare paas vo band ho gaya hai
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          // blacksilence stream for when user has no camera/mic
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            addLocalTracks(connections[id]);
            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({
                      sdp: connections[id].localDescription,
                    }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }),
    );
  }; // <-- getUserMediaSuccess ends HERE

  // =====================================
  // CHAT MESSAGE
  // =====================================

  // called for every message coming from the server
  // (server should emit: "chat-message", data, sender, socketIdSender, profilePic)
  const addMessageToChat = (data, sender, socketIdSender, senderPic) => {
    console.log("New chat message received");

    // our own message is already added locally when we send it
    if (socketIdSender && socketIdSender === socketIdRef.current) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: data,
        sender: sender || "User",
        profilePic: senderPic || "",
        mine: false,
        time: new Date(),
      },
    ]);

    // show unread badge only when chat is closed
    if (!showModalRef.current) {
      setNewMessages((prev) => prev + 1);
    }
  };

  // send a message to everyone in the call
  const sendMessage = () => {
    const text = message.trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit("chat-message", text, username, profilePic);

    // add our own message locally (shown on the LEFT)
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender: username,
        profilePic,
        mine: true,
        time: new Date(),
      },
    ]);

    setMessage("");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // keep latest message in view (newest at the bottom)
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showModal]);

  // =====================================
  // CREATE PEER CONNECTION
  // =====================================

  const createPeerConnection = (socketListId, id) => {
    console.log("Creating peer connection for:", socketListId);

    const peerConnection = new RTCPeerConnection(peerConfigConnections);

    connections[socketListId] = peerConnection;

    // ICE CANDIDATE
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

    // REMOTE STREAM
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];

      if (!remoteStream) {
        return;
      }

      console.log("Remote stream received:", socketListId);

      const videoExists = videoRef.current.find(
        (video) => video.socketId === socketListId,
      );

      if (videoExists) {
        const updatedVideos = videoRef.current.map((video) => {
          if (video.socketId === socketListId) {
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
          socketId: socketListId,
          stream: remoteStream,
          audio: true,
          playsInline: true,
        };

        const updatedVideos = [...videoRef.current, newVideo];

        videoRef.current = updatedVideos;
        setVideos(updatedVideos);
      }
    };

    // CONNECTION STATE
    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Peer ${socketListId} state:`,
        peerConnection.connectionState,
      );
    };

    // ADD LOCAL STREAM
    addLocalTracks(connections[socketListId]);

    if (id === socketIdRef.current) {
      for (let id2 in connections) {
        if (id2 === socketIdRef.current) continue;

        addLocalTracks(connections[id2]);

        connections[id2]
          .createOffer()
          .then((description) => {
            connections[id2].setLocalDescription(description).then(() => {
              socketRef.current.emit(
                "signal",
                id2,
                JSON.stringify({
                  // sdp = session description protocol
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

  let connectToSocketServer = () => {
    // never keep two sockets open
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      // set the id BEFORE joining, so it is ready when user-joined arrives
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessageToChat);

      socketRef.current.on("user-joined", (id, clients) => {
        console.log("user-joined", id, clients); // debug: check in both windows

        if (!Array.isArray(clients)) {
          console.error("user-joined received no clients list:", id, clients);
          return;
        }
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          pendingIce[socketListId] = [];

          // Wait for their ICE candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].ontrack = (event) => {
            const stream = event.streams[0];
            if (!stream) return;

            setVideos((prev) => {
              const exists = prev.some((v) => v.socketId === socketListId);

              const updated = exists
                ? prev.map((v) =>
                    v.socketId === socketListId ? { ...v, stream } : v,
                  )
                : [
                    ...prev,
                    {
                      socketId: socketListId,
                      stream,
                      autoplay: true,
                      playsinline: true,
                    },
                  ];

              videoRef.current = updated;
              return updated;
            });
          };

          // Add local tracks
          if (window.localStream !== undefined && window.localStream !== null) {
            addLocalTracks(connections[socketListId]);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            addLocalTracks(connections[socketListId]);
          }
        });

        // The user who just joined sends offers to everyone else
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({
                      sdp: connections[id2].localDescription,
                    }),
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });

    // USER LEFT
    socketRef.current.on("user-left", (id) => {
      console.log("User left:", id);

      if (connections[id]) {
        connections[id].close();
        delete connections[id];
      }
      delete pendingIce[id];

      const updatedVideos = videoRef.current.filter(
        (video) => video.socketId !== id,
      );

      videoRef.current = updatedVideos;

      setVideos(updatedVideos);
    });

    // SOCKET ERROR
    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }; // <-- connectToSocketServer ends HERE

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });

    canvas.getContext("2d").fillRect(0, 0, width, height);

    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
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
  // CAMERA / MIC TOGGLES
  // =====================================

  // Handle video toggle
  const handleVideo = () => {
    const track = window.localStream && window.localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideo(track.enabled);
  };

  // Handle audio toggle
  const handleAudio = () => {
    const track = window.localStream && window.localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudio(track.enabled);
  };

  // Handle screen toggle
  const handleScreen = () => {
    setScreen(!screen);
  };

  // Handle chat toggle
  const handleChat = () => {
    const next = !showModal;
    setShowModal(next);
    showModalRef.current = next;

    // opening the chat clears the unread badge
    if (next) setNewMessages(0);
  };

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    window.localStream = stream;
    // remember the screen stream so we can stop it when the button is clicked again
    window.screenStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      // replace the existing video sender's track instead of adding a new one,
      // so the remote side keeps the same stream and doesn't freeze afterwards
      const screenTrack = stream.getVideoTracks()[0];
      const videoSender = connections[id]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");

      if (videoSender) {
        videoSender.replaceTrack(screenTrack).catch((e) => console.log(e));
      } else {
        connections[id].addTrack(screenTrack, stream);
      }

      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription }),
              );
            })
            .catch((e) => console.log(e));
        })
        .catch((e) => console.log(e));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          // onended fires once per track; only handle it the first time
          if (window.localStream !== stream) return;
          window.screenStream = null;

          setScreen(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          // blacksilence stream for when user has no camera/mic
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          getUserMedia();
        }),
    );
  };

  let getDisplayMedia = async () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch((error) => {
            console.error("Error getting display media:", error);
          });
      }
    } else {
      // button clicked again while sharing -> stop sharing and bring camera back
      if (window.screenStream && window.localStream === window.screenStream) {
        window.screenStream = null;
        getUserMedia();
      }
    }
  };
  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen]);

  // =====================================
  // REQUEST PERMISSION
  // =====================================

  useEffect(() => {
    getPermission();

    return () => {
      // close connections and socket on unmount
      Object.keys(connections).forEach((id) => {
        connections[id].close();
        delete connections[id];
      });

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  // =====================================
  // RE-ATTACH LOCAL VIDEO (lobby <-> meeting)
  // =====================================

  useEffect(() => {
    if (localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

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
  // BACK / END CALL
  // =====================================

  const goBack = async () => {
    Object.keys(connections).forEach((id) => {
      connections[id].close();
      delete connections[id];
      delete pendingIce[id];
    });

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    socketIdRef.current = null;

    videoRef.current = [];
    setVideos([]);

    // clear chat for the next call
    setMessages([]);
    setNewMessages(0);

    // stop screen share (and any current stream) completely
    if (window.localStream) {
      window.localStream.getTracks().forEach((track) => {
        track.onended = null; // so the screen-share "ended" handler doesn't run
        track.stop();
      });
    }
    window.screenStream = null;
    window.localStream = null;
    setScreen(false);

    // go back to lobby with camera + mic on
    setVideo(true);
    setAudio(true);
    setAskForUsername(true);

    // get a fresh camera/mic stream for the lobby preview
    await getPermission();
    if (localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  };

  // =====================================
  // COMPONENT
  // =====================================

  return (
    <div>
      {askForUsername ? (
        // LOBBY
        <div className={styles.lobbyContainer}>
          <div className={styles.lobbyCard}>
            <div className={styles.lobbyForm}>
              <h2>Enter into lobby</h2>
              <p>Pick a name and check your camera before you join.</p>

              <TextField
                id="outlined-basic"
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") connect();
                }}
                variant="outlined"
              />

              <Button variant="contained" size="large" onClick={connect}>
                Connect
              </Button>
            </div>

            <div className={styles.lobbyPreview}>
              <video
                ref={localVideoRef}
                className={styles.lobbyVideo}
                autoPlay
                muted
                playsInline
              />

              {/* Buttons under the video (lobby) */}
              <div className={styles.lobbyControls}>
                <IconButton onClick={handleVideo} style={{ color: "black" }}>
                  {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>

                <IconButton onClick={handleAudio} style={{ color: "black" }}>
                  {audio === true ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // MEETING: video stage on the left, chat panel on the right
        <div className={styles.meetVideoContainer}>
          <div className={styles.stage}>
            {/* Other users' videos */}
            <div className={styles.conferenceView}>
              {videos.length === 0 && (
                <div className={styles.emptyState}>
                  <h3>Waiting for others to join</h3>
                  <span>Share this page link so they can enter the call.</span>
                </div>
              )}

              {videos.map((video) => (
                <video
                  key={video.socketId}
                  data-socket={video.socketId}
                  autoPlay
                  playsInline
                  ref={(videoElement) => {
                    if (
                      videoElement &&
                      video.stream &&
                      videoElement.srcObject !== video.stream
                    ) {
                      videoElement.srcObject = video.stream;
                    }
                  }}
                />
              ))}
            </div>

            {/* My own video (bottom left) */}
            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
            />

            {/* Buttons (bottom center) */}
            <div className={styles.buttonContainers}>
              <IconButton
                onClick={handleVideo}
                className={`${styles.controlBtn} ${
                  video ? "" : styles.controlOff
                }`}
                style={{ color: "white" }}
              >
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton
                onClick={handleAudio}
                className={`${styles.controlBtn} ${
                  audio ? "" : styles.controlOff
                }`}
                style={{ color: "white" }}
              >
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable === true ? (
                <IconButton
                  onClick={handleScreen}
                  className={styles.controlBtn}
                  style={{ color: "white" }}
                >
                  {screen === true ? (
                    <StopScreenShareIcon />
                  ) : (
                    <ScreenShareIcon />
                  )}
                </IconButton>
              ) : (
                <></>
              )}

              <Badge badgeContent={newMessages} max={999} color="warning">
                <IconButton
                  onClick={handleChat}
                  className={styles.controlBtn}
                  style={{ color: "white" }}
                >
                  <ChatIcon />
                </IconButton>
              </Badge>

              <IconButton onClick={goBack} className={styles.endCallBtn}>
                <CallEndIcon />
              </IconButton>
            </div>
          </div>

          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>Chat Room</div>

                {/* messages: oldest on top, newest at the bottom */}
                <div className={styles.chattingArea}>
                  {messages.length === 0 && (
                    <div className={styles.chatEmpty}>
                      No messages yet. Say hello!
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.msgRow} ${
                        msg.mine ? styles.msgMine : styles.msgOther
                      }`}
                    >
                      {/* profile picture, or a demo user icon if none */}
                      <Avatar
                        src={msg.profilePic || undefined}
                        alt={msg.sender}
                        sx={{ width: 32, height: 32, bgcolor: "#4f5b8a" }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>

                      <div className={styles.msgBubble}>
                        <div className={styles.msgSender}>
                          {msg.mine ? `${msg.sender} (You)` : msg.sender}
                        </div>
                        <div className={styles.msgText}>{msg.text}</div>
                        <span className={styles.msgTime}>
                          {formatTime(msg.time)}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div ref={chatEndRef} />
                </div>

                {/* text box at the bottom */}
                <div className={styles.chatInputBar}>
                  <TextField
                    id="standard-basic"
                    label="Type a message"
                    variant="outlined"
                    size="small"
                    multiline
                    maxRows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleChatKeyDown}
                    sx={{
                      "& .MuiInputBase-root": { color: "#e9ecf6" },
                      "& textarea": { color: "#e9ecf6", caretColor: "#e9ecf6" },
                      "& .MuiInputLabel-root": { color: "#8f98b8" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#4f8cff" },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.18)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.35)",
                      },
                    }}
                  />
                  <IconButton
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    style={{ color: message.trim() ? "#4f8cff" : "#5b6382" }}
                  >
                    <SendIcon />
                  </IconButton>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
