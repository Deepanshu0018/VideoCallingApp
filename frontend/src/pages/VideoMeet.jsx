import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
// eslint-disable-next-line no-unused-vars
import { Badge, IconButton, TextField, Button, Box, Paper, Typography, Card, CardContent } from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

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

return (

    <div>

      {askForUsername ? (

        <Box className={styles.lobbyContainer}>
          <Paper elevation={8} className={styles.lobbyCard}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Join Meeting
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: '#666' }}>
              Enter your name to join the video call
            </Typography>

            <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <video ref={localVideoref} autoPlay muted className={styles.lobbyPreview} />
            </Box>

            <TextField
              fullWidth
              label="Your Name"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && connect()}
              placeholder="Enter your name"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Button 
              fullWidth
              variant="contained" 
              onClick={connect}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              Join Now
            </Button>
          </Paper>
        </Box>

      ) : (

        <Box className={styles.meetVideoContainer}>

          {showModal && (
            <Card className={styles.chatRoom} elevation={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                  Chat Messages
                </Typography>
                <IconButton size="small" onClick={() => setModal(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box className={styles.chatMessages}>
                {messages.length ? (
                  messages.map((item, i) => (
                    <Box key={i} sx={{ mb: 1.5, pb: 1.5, borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#667eea' }}>
                        {item.sender}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#333', wordBreak: 'break-word' }}>
                        {item.data}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 3 }}>
                    No messages yet
                  </Typography>
                )}
              </Box>

              <Box className={styles.chatInput}>
                <TextField
                  fullWidth
                  size="small"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    }
                  }}
                />
                <IconButton 
                  onClick={sendMessage}
                  size="small"
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.85,
                    }
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </Card>
          )}

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
          />

          <Box className={styles.conferenceView}>
            {videos.map(video => (
              <Box key={video.socketId} className={styles.videoWrapper}>
                <video
                  ref={ref => {
                    if (ref && video.stream) ref.srcObject = video.stream;
                  }}
                  autoPlay
                />
              </Box>
            ))}
          </Box>

          <Box className={styles.buttonContainers}>
            <Box className={styles.controlsBox}>
              <IconButton 
                onClick={handleVideo}
                className={styles.controlButton}
                sx={{
                  background: video ? '#667eea' : '#ff4444',
                  color: 'white',
                  '&:hover': { opacity: 0.85 },
                  transition: 'all 0.3s ease',
                }}
                title={video ? "Turn off camera" : "Turn on camera"}
              >
                {video ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>

              <IconButton 
                onClick={handleAudio}
                className={styles.controlButton}
                sx={{
                  background: audio ? '#667eea' : '#ff4444',
                  color: 'white',
                  '&:hover': { opacity: 0.85 },
                  transition: 'all 0.3s ease',
                }}
                title={audio ? "Turn off microphone" : "Turn on microphone"}
              >
                {audio ? <MicIcon /> : <MicOffIcon />}
              </IconButton>

              <Badge badgeContent={newMessages} color="error" sx={{ '& .MuiBadge-badge': { background: '#f5576c', fontWeight: 700 } }}>
                <IconButton 
                  onClick={() => setModal(!showModal)}
                  className={styles.controlButton}
                  sx={{
                    background: '#764ba2',
                    color: 'white',
                    '&:hover': { opacity: 0.85 },
                    transition: 'all 0.3s ease',
                  }}
                  title="Open chat"
                >
                  <ChatIcon />
                </IconButton>
              </Badge>

              <IconButton 
                onClick={handleEndCall}
                className={styles.controlButton}
                sx={{
                  background: '#f5576c',
                  color: 'white',
                  '&:hover': { 
                    background: '#e63946',
                    opacity: 0.85,
                  },
                  transition: 'all 0.3s ease',
                }}
                title="End call"
              >
                <CallEndIcon />
              </IconButton>
            </Box>
          </Box>

        </Box>

      )}

    </div>

  );

}