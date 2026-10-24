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

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    // FIX: signal can arrive before the connection exists -> would crash
    if (!connections[fromId]) return;

    // matlab from id mai nahi huuu
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
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
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e));
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
    // FIX: localVideoref -> localVideoRef
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            // FIX: socketIdRef.current.emit -> socketRef.current.emit
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription }),
            );
          })
          .catch((e) => console.log(e));
      });
    }

    // FIX: the for loop is closed above, and the function is closed properly
    // below, so everything after it is no longer nested inside this function.

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
          // FIX: clocalVideoRef -> localVideoRef
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);
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

  // FIX: `id` was undefined inside this function, so it is now a 2nd parameter
  // (the id of the user who just joined). Optional, so the old call
  // createPeerConnection(socketListId) still works.
  const createPeerConnection = (socketListId, id) => {
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

      // FIX: video.id -> video.socketId (same name used everywhere now)
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

    // FIX: socketIRef -> socketIdRef
    if (id === socketIdRef.current) {
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

  let connectToSocketServer = () => {
    // FIX: io.connect -> io (current socket.io-client way)
    socketRef.current = io(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      // FIX: addMessage did not exist -> addMessageToChat
      socketRef.current.on("chat-message", addMessageToChat);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          // FIX: don't create a connection for myself, and don't overwrite
          // a connection that already exists (it would break running calls)
          if (socketListId === socketIdRef.current) return;
          if (connections[socketListId]) return;

          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );

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
          connections[socketListId].onaddstream = (event) => {
            console.log("BEFORE:", videoRef.current);
            console.log("FINDING ID:", socketListId);

            let videoExists = videoRef.current.find(
              (video) => video.socketId === socketListId,
            );

            if (videoExists) {
              console.log("FOUND EXISTING");

              // Update the existing video's stream
              setVideos((videos) => {
                const updatedVideos = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video,
                );

                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              // Create a new video
              console.log("CREATING NEW");

              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };

              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);

            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) {}

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

    // =====================================
    // USER LEFT
    // =====================================

    // FIX: moved INSIDE connectToSocketServer (before, socketRef.current was
    // still null when this line ran, and it was outside the function)
    socketRef.current.on("user-left", (id) => {
      console.log("User left:", id);

      if (connections[id]) {
        connections[id].close();
        delete connections[id];
      }

      // FIX: video.id -> video.socketId
      const updatedVideos = videoRef.current.filter(
        (video) => video.socketId !== id,
      );

      videoRef.current = updatedVideos;

      setVideos(updatedVideos);
    });

    // =====================================
    // SOCKET ERROR
    // =====================================

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
  // RE-ATTACH LOCAL VIDEO (lobby <-> meeting)
  // =====================================

  // FIX: lobby and meeting use two different <video> elements with the same
  // ref. When the view switches, the new element has no srcObject (black
  // screen), so attach the stream again.
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

          <div className="meetVideoContainer">
            <div className="buttonContainers">
              {/* Video Cam Icon */}
              <IconButton style={{ color: "black" }}>
                {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              {/* Call end icon */}
              <IconButton style={{ color: "red" }}>
                <CallEndIcon />
              </IconButton>

              {/* Mic Icon */}
              <IconButton style={{ color: "black" }}>
                {audio === true ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              {/* screen share icon */}
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
            </div>

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

            {/* Remote videos in lobby */}
            {videos.map((video) => (
              <div className="conferenceView" key={video.socketId}>
                <h2>{video.socketId}</h2>

                <video
                  data-socket={video.socketId}
                  autoPlay
                  playsInline
                  ref={(ref) => {
                    if (ref && video.stream) {
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

// working on ui side
// as ui is slightly different
