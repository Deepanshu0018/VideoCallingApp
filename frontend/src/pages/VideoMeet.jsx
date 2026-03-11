import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatIcon from "@mui/icons-material/Chat";

import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;

let connections = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {

  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();

  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [newMessages, setNewMessages] = useState(0);
  const [showModal, setModal] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  /* ================= CAMERA ================= */

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      window.localStream = stream;

      if (localVideoref.current) {
        localVideoref.current.srcObject = stream;
      }

    } catch (err) {
      console.log(err);
    }

  };

  /* Fix purple screen after leaving lobby */

  useEffect(() => {
    if (!askForUsername && window.localStream && localVideoref.current) {
      localVideoref.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  /* ================= SOCKET ================= */

  const connectToSocketServer = () => {

    socketRef.current = io(server_url, {
      transports: ["websocket"]
    });

    socketRef.current.on("connect", () => {

      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos(videos => videos.filter(v => v.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {

        clients.forEach(socketListId => {

          if (connections[socketListId]) return;

          connections[socketListId] =
            new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = event => {

            if (event.candidate) {

              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate })
              );

            }

          };

          connections[socketListId].ontrack = event => {

            let videoExists =
              videoRef.current.find(v => v.socketId === socketListId);

            if (videoExists) {

              setVideos(videos => {

                const updated = videos.map(v =>
                  v.socketId === socketListId
                    ? { ...v, stream: event.streams[0] }
                    : v
                );

                videoRef.current = updated;
                return updated;

              });

            } else {

              const newVideo = {
                socketId: socketListId,
                stream: event.streams[0]
              };

              setVideos(videos => {

                const updated = [...videos, newVideo];
                videoRef.current = updated;
                return updated;

              });

            }

          };

          if (window.localStream) {

            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });

          }

        });

      });

    });

  };



 const addMessage = (data, sender, socketIdSender) => {

  if (!data) return;

  setMessages(prev => [
    ...prev,
    { sender: sender || "User", data }
  ]);

  if (socketIdSender !== socketIdRef.current) {
    setNewMessages(prev => prev + 1);
  }

};

const sendMessage = () => {

  if (!message.trim()) return;

  socketRef.current.emit("chat-message", message, username);

  setMessage("");

};



  const handleVideo = () => {

    const track = window.localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;

    setVideo(track.enabled);

  };

  const handleAudio = () => {

    const track = window.localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;

    setAudio(track.enabled);

  };

  const handleEndCall = () => {

    try {

      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());

    } catch {}

    window.location.href = "/";

  };

  const connect = async () => {

    if (!username.trim()) return;

    if (!window.localStream) {
      await getPermissions();
    }

    setAskForUsername(false);
    connectToSocketServer();

  };

 //

  return (

    <div>

      {askForUsername ? (

        <div>

          <h2>Enter into Lobby</h2>

          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <Button variant="contained" onClick={connect}>
            Connect
          </Button>

          <video ref={localVideoref} autoPlay muted />

        </div>

      ) : (

        <div className={styles.meetVideoContainer}>

          {showModal && (

            <div className={styles.chatRoom}>

              <h2>Chat</h2>

              <div className={styles.chatMessages}>

                {messages.length ? (

                  messages.map((item, i) => (

                    <div key={i}>
                      <b>{item.sender}</b>
                      <p>{item.data}</p>
                    </div>

                  ))

                ) : <p>No messages yet</p>}

              </div>

              <div className={styles.chatInput}>

                <TextField
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  label="Message"
                />

                <Button onClick={sendMessage}>
                  Send
                </Button>

              </div>

            </div>

          )}

          <div className={styles.buttonContainers}>

            <IconButton onClick={handleVideo}>
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>

            <IconButton onClick={handleAudio}>
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <Badge badgeContent={newMessages} color="error">
              <IconButton onClick={() => setModal(!showModal)}>
                <ChatIcon />
              </IconButton>
            </Badge>

          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          />

          <div className={styles.conferenceView}>

            {videos.map(video => (

              <video
                key={video.socketId}
                ref={ref => {
                  if (ref && video.stream) ref.srcObject = video.stream;
                }}
                autoPlay
              />

            ))}

          </div>

        </div>

      )}

    </div>

  );

}