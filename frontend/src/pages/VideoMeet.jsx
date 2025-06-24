import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField } from "@mui/material";
import { Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";
import { Box, Paper, Stack, Typography } from "@mui/material";

const server_url = server;

var connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoref = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);

  let [screen, setScreen] = useState();

  let [showModal, setModal] = useState(true);

  let [screenAvailable, setScreenAvailable] = useState();

  let [messages, setMessages] = useState([]);

  let [message, setMessage] = useState("");

  let [newMessages, setNewMessages] = useState(3);

  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");

  const videoRef = useRef([]);

  let [videos, setVideos] = useState([]);

  // TODO
  // if(isChrome() === false) {

  // }

  useEffect(() => {
    console.log("HELLO");
    getPermissions();
  }, []);

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then((stream) => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setVideoAvailable(true);
      setAudioAvailable(true);
      window.localStream = userMediaStream; // ✅ first set this
      window.localStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = true));

      if (localVideoref.current) {
        localVideoref.current.srcObject = userMediaStream;
      }
    } catch (error) {
      console.log(error);
    }
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        console.log(description);
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          for (let id in connections) {
            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description) => {
              connections[id]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id,
                    JSON.stringify({ sdp: connections[id].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        })
    );
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    console.log("HERE");
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socketRef.current.emit(
              "signal",
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            );
          })
          .catch((e) => console.log(e));
      });
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setScreen(false);

          try {
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoref.current.srcObject = window.localStream;

          getUserMedia();
        })
    );
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

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
                        })
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

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      const roomUrl = new URL(window.location.href);
      const path = roomUrl.pathname;

      socketRef.current.emit("join-call", { path, username });

      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", (data, sender, socketIdSender) => {
        addMessage(data, sender, socketIdSender);
      });

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections
          );
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );
            }
          };

          // Wait for their video stream
          connections[socketListId].ontrack = (event) => {
            console.log("📥 Remote tracks received:", event.streams[0]);

            const incomingStream = event.streams[0];

            // Check if stream already exists
            const existing = videoRef.current.find(
              (v) => v.socketId === socketListId
            );
            if (existing) {
              setVideos((prev) =>
                prev.map((v) =>
                  v.socketId === socketListId
                    ? { ...v, stream: incomingStream }
                    : v
                )
              );
              videoRef.current = videoRef.current.map((v) =>
                v.socketId === socketListId
                  ? { ...v, stream: incomingStream }
                  : v
              );
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: incomingStream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((prev) => {
                const updated = [...prev, newVideo];
                videoRef.current = updated;
                return updated;
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
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  );
                })
                .catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
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

  let handleAudio = () => {
    const audioTracks = window.localStream?.getAudioTracks();
    if (audioTracks && audioTracks.length > 0) {
      const enabled = audioTracks[0].enabled;
      audioTracks[0].enabled = !enabled;
      setAudio(!enabled);
    }
  };

  let handleVideo = () => {
    const videoTracks = window.localStream?.getVideoTracks();
    if (videoTracks && videoTracks.length > 0) {
      const enabled = videoTracks[0].enabled;
      videoTracks[0].enabled = !enabled;
      setVideo(!enabled);
    }
  };

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);
  let handleScreen = () => {
    setScreen(!screen);
  };

  let handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {}
    window.location.href = "/";
  };

  let openChat = () => {
    setModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  let connect = async () => {
    setAskForUsername(false);
    getMedia();

    try {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(getUserMediaSuccess)
        .catch((err) => {
          console.log("Error getting user media:", err);
          alert("Please allow camera and microphone access.");
        });
    } catch (err) {
      console.log("Error getting user media:", err);
      alert("Please allow camera and microphone access.");
    }
  };

  return (
    <div>
      {askForUsername === true ? (
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
            padding: 2,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              padding: 4,
              borderRadius: 4,
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              width: "100%",
              maxWidth: "70vh",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: "#facc15", fontWeight: "bold" }}
            >
              🎉 Welcome to UniMeet
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "#cbd5e1", marginBottom: 3 }}
            >
              Join the meeting, connect with others, and collaborate in
              real-time!
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  input: { color: "white" },
                  label: { color: "#cbd5e1" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#475569",
                    },
                    "&:hover fieldset": {
                      borderColor: "#facc15",
                    },
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={connect}
                fullWidth
                size="large"
                sx={{
                  backgroundColor: "#3b82f6",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                }}
              >
                🚀 Connect
              </Button>
            </Stack>

            <Box
              sx={{
                marginTop: 4,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <video
                ref={localVideoref}
                autoPlay
                muted
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  borderRadius: "1rem",
                  border: "2px solid #334155",
                  boxShadow: "0 0 15px rgba(0, 0, 0, 0.4)",
                  background: "black",
                }}
              ></video>
            </Box>
          </Paper>
        </Box>
      ) : (
        <div className={styles.meetVideoContainer}>
          <h2 className={styles.meetingHeading}>📹 Live Meeting</h2>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                  <h1>Chat</h1>
                  <button
                    className={styles.chatCloseBtn}
                    onClick={() => setModal(false)}
                  >
                    ✖
                  </button>
                </div>

                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => {
                      console.log(messages);
                      return (
                        <div style={{ marginBottom: "20px" }} key={index}>
                          <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                          <p>{item.data}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>

                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : (
              <></>
            )}

            <Badge badgeContent={newMessages} max={999} color="orange">
              <IconButton
                onClick={() => setModal(!showModal)}
                style={{ color: "white" }}
              >
                <ChatIcon />{" "}
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          ></video>

          <div className={styles.conferenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                <video
                  key={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                      ref.onloadedmetadata = () => {
                        ref.muted = false; // ✅ Don't mute remote video
                        ref.volume = 1.0; // ✅ Set volume explicitly
                        const playPromise = ref.play();
                        if (playPromise !== undefined) {
                          playPromise.catch((e) =>
                            console.warn("Autoplay failed:", e.message)
                          );
                        }
                      };
                    }
                  }}
                  autoPlay
                  playsInline
                  controls={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
