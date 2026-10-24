import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, TextField, Badge } from "@mui/material";
import { io } from "socket.io-client";
import "../styles/videoComponent.module.css";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";

// Backend Socket.IO server
const server_url = "http://localhost:5000";

const connections = {};

// FIXED: ICE candidates that arrive before the remote description is set
const pendingIce = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

// helper that adds local tracks with addTrack (addStream is deprecated
// and missing in some browsers)
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

  // FIXED: `screen` was never declared (it was the browser's window.screen,
  // so `screen == true` was always false)
  const [screen, setScreen] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [newMessages, setNewMessages] = useState(33);

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
            // FIXED: apply ICE candidates that arrived early
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
        // FIXED: adding a candidate before setRemoteDescription fails silently,
        // so queue it until the remote description exists
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

      addLocalTracks(connections[id]); // FIXED: addStream -> addLocalTracks

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

          // Todo: blacksilence stream for when user has no camera/mic it will send a black screen and silence to other users
          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            addLocalTracks(connections[id]); // FIXED: addStream -> addLocalTracks
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

  const addMessageToChat = () => {
    console.log("New chat message received");
  };

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
    // FIXED: addStream -> addLocalTracks
    addLocalTracks(connections[socketListId]);

    if (id === socketIdRef.current) {
      for (let id2 in connections) {
        if (id2 === socketIdRef.current) continue;

        addLocalTracks(connections[id2]); // FIXED: addStream -> addLocalTracks

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
    // FIXED: never keep two sockets open (Back + Connect used to open a 2nd one)
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      // FIXED: set the id BEFORE joining, so it is ready when user-joined arrives
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessageToChat);

      socketRef.current.on("user-joined", (id, clients) => {
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
          pendingIce[socketListId] = []; // FIXED

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

          // onaddstream -> ontrack
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

          // add local tracks with addTrack instead of addStream
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
      delete pendingIce[id]; // FIXED

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

  // FIXED: the buttons had no onClick. These flip track.enabled, so the
  // camera is not restarted (restarting caused the double "Permission granted")
  const toggleVideo = () => {
    const track = window.localStream && window.localStream.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setVideo(track.enabled);
  };

  const toggleAudio = () => {
    const track = window.localStream && window.localStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setAudio(track.enabled);
  };

  // =====================================
  // REQUEST PERMISSION
  // =====================================

  useEffect(() => {
    getPermission();

    return () => {
      // FIXED: also close connections and socket on unmount
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
  // UPDATE MEDIA
  // =====================================

  // FIXED: this effect was removed. It ran getUserMedia() at the same time as
  // getPermission(), so two camera streams were opened and one was left running
  // (camera light stuck on). getUserMedia() above is kept but no longer
  // called automatically.

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
  // BACK BUTTON
  // =====================================

  // FIXED: Back used to only flip the view, leaving the socket and peer
  // connections alive. Connecting again then skipped the old (dead)
  // connections, so no remote video appeared.
  const goBack = () => {
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

          <div className="meetVideoContainer">
            <video
              className="meetUserVideo"
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

            {/* Buttons at the bottom of the video (lobby) */}
            <div className="buttonContainers">
              <IconButton onClick={toggleVideo} style={{ color: "black" }}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton onClick={goBack} style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>

              <IconButton onClick={toggleAudio} style={{ color: "black" }}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {screenAvailable == true ? (
                <IconButton>
                  {screen == true ? (
                    <ScreenShareIcon />
                  ) : (
                    <StopScreenShareIcon />
                  )}
                </IconButton>
              ) : (
                <></>
              )}

              <Badge badgeContent={newMessages} max={999} color="warning">
                <IconButton style={{ color: "black" }}>
                  <ChatIcon />
                </IconButton>
              </Badge>
            </div>

            {/* Remote videos in lobby */}
            {videos.map((video) => (
              <div className="conferenceView" key={video.socketId}>
                <h2>{video.socketId}</h2>

                <video
                  data-socket={video.socketId}
                  autoPlay
                  playsInline
                  ref={(ref) => {
                    // FIXED: only set srcObject when it changed (stops flicker)
                    if (ref && video.stream && ref.srcObject !== video.stream) {
                      ref.srcObject = video.stream;
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
        </div>
      ) : (
        <div className="meetVideoContainer">
          <h2>Welcome {username}</h2>

          {/* Local video */}
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

          {/* Buttons at the bottom of the video (meeting) */}
          <div className="buttonContainers">
            <IconButton onClick={toggleVideo} style={{ color: "black" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={goBack} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={toggleAudio} style={{ color: "black" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable == true ? (
              <IconButton>
                {screen == true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="warning">
              <IconButton style={{ color: "black" }}>
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          {/* Remote videos */}
          <div className="meetVideoContainer">
            {videos.map((video) => (
              <div key={video.socketId}>
                <h2>{video.socketId}</h2>

                <video
                  data-socket={video.socketId}
                  autoPlay
                  playsInline
                  ref={(videoElement) => {
                    // FIXED: only set srcObject when it changed (stops flicker)
                    if (
                      videoElement &&
                      video.stream &&
                      videoElement.srcObject !== video.stream
                    ) {
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
