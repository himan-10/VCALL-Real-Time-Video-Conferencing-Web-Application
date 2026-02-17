
import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";

// MUI components
import { Badge, IconButton, TextField, Button, Snackbar, Alert } from '@mui/material';

// Icons
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import PanToolIcon from '@mui/icons-material/PanTool'; // Hand Raise
import AddReactionIcon from '@mui/icons-material/AddReaction'; // Reaction


// Styles & server
// Styles & server
// import styles from "../styles/videoComponent.module.css";
import server from '../environment';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';


const server_url = server;

// Store all peer connections (socketId → RTCPeerConnection)


// STUN server config
const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeetComponent() {

    // Socket reference
    const socketRef = useRef();

    // Current socket id
    const socketIdRef = useRef();

    // Local video element reference
    const localVideoref = useRef();
    const connectionsRef = useRef({});

    // Media availability flags
    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);

    // Media toggle states
    const [video, setVideo] = useState(true);
    const [audio, setAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);

    // Remote videos list
    const [videos, setVideos] = useState([]);

    // Lobby state
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");

    // Reaction & Hand Raise states
    const [handRaised, setHandRaised] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [reactions, setReactions] = useState([]); // [{ socketId, emoji, id }]

    // Chat states
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [showModal, setModal] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });



    // React when video/audio toggle changes

    // Auth & History
    const { getHistoryOfUser } = React.useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Manage Password State
    const [password, setPassword] = useState(location.state?.password || "");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Verify token by fetching history
            getHistoryOfUser()
                .then(userData => {
                    // Token is valid
                    console.log("User verified", userData);
                    setUsername(userData.username);
                })
                .catch(e => {
                    console.log("Invalid token", e);
                    localStorage.removeItem("token");
                    navigate("/auth");
                })
        }
        // If no token, stay as guest
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // Re-attach stream when view changes
    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    // Unified function to get User Media (Camera/Mic)
    const getUserMedia = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video, audio });

            // If explicit constraints fail (e.g. device missing), try fallback
            // But usually we want to respect the state.

            window.localStream = stream;
            localVideoref.current.srcObject = stream;

            replaceTracks(stream);
        } catch (e) {
            console.error("Error getting user media:", e);
            // Handle error (e.g. deny permission)
        }
    };

    // Replace tracks for all connected peers
    const replaceTracks = (stream) => {
        stream.getTracks().forEach(track => {
            for (let id in connectionsRef.current) {
                const senders = connectionsRef.current[id].getSenders();
                const sender = senders.find(s => s.track && s.track.kind === track.kind);

                if (sender) {
                    sender.replaceTrack(track);
                } else {
                    // If no sender for this track kind, add it
                    connectionsRef.current[id].addTrack(track, stream);
                }
            }
        });
    };

    // On load → Get initial media
    useEffect(() => {
        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        }
        getUserMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get screen share
    const getDisplayMedia = async () => {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        replaceTracks(stream);

        // When screen sharing stops → return to camera
        stream.getTracks().forEach(track => {
            track.onended = () => {
                setScreen(false);
                getUserMedia();
            };
        });
    };

    // React when video/audio toggle changes
    useEffect(() => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            const audioTrack = window.localStream.getAudioTracks()[0];

            const meetingCode = window.location.pathname.substring(1); // CORRECT: Use path not href

            if (videoTrack) {
                videoTrack.enabled = video;
                if (socketRef.current) socketRef.current.emit("toggle-media", "video", video, meetingCode);
            }
            if (audioTrack) {
                audioTrack.enabled = audio;
                if (socketRef.current) socketRef.current.emit("toggle-media", "audio", audio, meetingCode);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video, audio]);

    // ... (rest of the file)

    // React when screen toggle changes
    useEffect(() => {
        if (screen) getDisplayMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen]);

    // Ensure local video stream is attached when switching from Lobby to Meeting
    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [askForUsername]);

    // Helper: Add connection
    const addConnection = (socketListId, socketUsername, createOffer) => {
        const isAlreadyConnected = connectionsRef.current[socketListId];

        if (isAlreadyConnected) {
            return connectionsRef.current[socketListId];
        }

        console.log(`[WEBRTC] Creating new connection for ${socketListId} (${socketUsername})`);

        const pc = new RTCPeerConnection(peerConfigConnections);
        connectionsRef.current[socketListId] = pc;

        // ICE candidate
        pc.onicecandidate = event => {
            if (event.candidate) {
                socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
        };

        // On Track
        pc.ontrack = event => {
            console.log(`[WEBRTC] Track received from ${socketListId}:`, event.streams[0].id);
            const stream = event.streams[0];

            setVideos(prev => {
                const exists = prev.find(v => v.socketId === socketListId);
                if (exists) {
                    return prev.map(v => v.socketId === socketListId ? { ...v, stream, username: socketUsername } : v);
                }
                return [...prev, { socketId: socketListId, stream, username: socketUsername }];
            });
        };

        // Add local tracks
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => {
                pc.addTrack(track, window.localStream);
            });
        }

        // Create Offer if needed (Initiator)
        if (createOffer) {
            console.log(`[WEBRTC] Creating Offer for ${socketListId}`);
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    socketRef.current.emit("signal", socketListId, JSON.stringify({ sdp: pc.localDescription }));
                })
                .catch(e => console.error("Error creating offer:", e));
        }

        return pc;
    };

    // Handle incoming signaling messages
    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);

        // Lazy creation for incoming Offer (Mesh robustness)
        if (!connectionsRef.current[fromId] && signal.sdp && signal.sdp.type === "offer") {
            console.log(`[SIGNAL] Lazy creating connection for ${fromId} (Handling Offer)`);
            addConnection(fromId, "Remote User", false); // We are answerer, so false
        }

        const pc = connectionsRef.current[fromId];
        if (!pc) return;

        // SDP handling
        if (signal.sdp) {
            pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                .then(() => {
                    if (signal.sdp.type === "offer") {
                        pc.createAnswer()
                            .then(answer => pc.setLocalDescription(answer))
                            .then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: pc.localDescription }));
                            })
                            .catch(e => console.error("Error creating answer:", e));
                    }
                })
                .catch(e => console.error("Error setting remote description:", e));
        }

        // ICE candidate handling
        if (signal.ice) {
            pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.error("Error adding ice:", e));
        }
    };

    // Connect to socket server
    const connectToSocketServer = () => {
        const path = window.location.pathname.substring(1); // Get meeting code

        if (socketRef.current && socketRef.current.connected) {
            return;
        }

        console.log("Connecting to socket server at:", server_url);

        try {
            socketRef.current = io.connect(server_url, { secure: true });
        } catch (error) {
            console.error("Error creating socket instance:", error);
            return;
        }

        // Error handling
        socketRef.current.on("error", (err) => {
            console.error("Socket Error:", err);
            // alert(err.message); // Don't use window.alert if possible, use snackbar or just UI state
            if (err.message === "Invalid Password") {
                setAskForUsername(true); // Return to lobby
                setSnackbar({ open: true, message: "Invalid Password! Please try again.", severity: "error" });
                // Disconnect to retry
                socketRef.current.disconnect();
            } else {
                setSnackbar({ open: true, message: err.message, severity: "error" });
                window.location.href = "/";
            }

        });

        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            console.log("Socket connected successfully with ID:", socketRef.current.id);
            socketIdRef.current = socketRef.current.id;

            console.log(`[FE] Emitting join-call for room: ${path}`);
            socketRef.current.emit("join-call", path, username || "Guest", password);

            // Chat message listener
            socketRef.current.off("chat-message"); // Prevent duplicate listeners
            socketRef.current.on("chat-message", (data, sender, socketId) => {
                console.log(`[FE] Chat received from ${sender}: ${data}`);
                setMessages(prev => [...prev, { sender, data }]);
                if (socketId !== socketIdRef.current) {
                    setNewMessages(prev => prev + 1);
                }
            });

            // Listen for media toggles
            socketRef.current.on("media-toggled", (id, kind, enabled) => {
                setVideos(prev => prev.map(v => {
                    if (v.socketId === id) return { ...v, [kind]: enabled };
                    return v;
                }));
            });

            socketRef.current.on("user-left", id => {
                setVideos(videos => {
                    const user = videos.find(v => v.socketId === id);
                    if (user) setSnackbar({ open: true, message: `${user.username} left the call`, severity: "info" });
                    return videos.filter(v => v.socketId !== id);
                });
                delete connectionsRef.current[id];
            });

            socketRef.current.on("hand-toggled", (id, isRaised) => {
                setVideos(prev => prev.map(v => {
                    if (v.socketId === id) return { ...v, handRaised: isRaised };
                    return v;
                }));
            });

            // ...
        });

        // Handle Reaction (kept separate as requested)
        socketRef.current.on("reaction-received", (id, emoji) => {
            const newReaction = { socketId: id, emoji, id: Date.now() + Math.random() };
            setReactions(prev => [...prev, newReaction]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== newReaction.id));
            }, 4000); // Remove after 4s
        });

        // User joined
        socketRef.current.on("user-joined", (id, clients, remoteUsername) => {
            console.log("User Joined Event:", id, remoteUsername, clients);

            if (id !== socketIdRef.current) {
                setSnackbar({ open: true, message: `${remoteUsername || "Someone"} joined the call`, severity: "success" });
            }

            clients.forEach(client => {
                const socketListId = client.id || client;
                const socketUsername = client.username || "Remote User";

                // Skip self
                if (socketListId === socketIdRef.current) return;

                // Determine if we should create an offer for this client
                // Rule: If I am the new user (my ID matches 'id' from event), I initiate connection to everyone.
                // Existing users receive this event for ME, but they wait for my offer.

                const shouldCreateOffer = (id === socketIdRef.current);

                addConnection(socketListId, socketUsername, shouldCreateOffer);
            });
        });
    };


    // Connect button
    const connect = () => {
        setAskForUsername(false);
        connectToSocketServer();
    };

    // Send chat message
    const sendMessage = () => {
        socketRef.current.emit("chat-message", message, username); // Backend determines room from socket
        setMessage("");
    };

    // Hand Raise & Reaction Logic
    const toggleHand = () => {
        setHandRaised(!handRaised);
        const meetingCode = window.location.pathname.substring(1);
        if (socketRef.current) socketRef.current.emit("toggle-hand", !handRaised, meetingCode);
    };

    const sendReaction = (emoji) => {
        const meetingCode = window.location.pathname.substring(1);
        if (socketRef.current) socketRef.current.emit("reaction", emoji, meetingCode);
        const newReaction = { socketId: socketIdRef.current, emoji, id: Date.now() + Math.random() };
        setReactions(prev => [...prev, newReaction]);
        setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 4000); // Remove after 4s
        setShowReactions(false);
    };

    const emojis = ["👍", "❤️", "😂", "😮", "😢", "👏"];

    return (
        <div className="min-h-screen bg-black text-white">
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {askForUsername ? (
                <div className="flex flex-col items-center justify-center min-h-screen gap-6">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">Enter Lobby</h2>
                    <TextField
                        id="outlined-basic"
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        variant="outlined"
                        sx={{
                            input: { color: 'white' },
                            label: { color: 'gray' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'gray' },
                                '&:hover fieldset': { borderColor: '#f97316' }, // orange-500
                                '&.Mui-focused fieldset': { borderColor: '#f97316' },
                            },
                        }}
                    />
                    <TextField
                        id="outlined-password"
                        label="Password (Optional)"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        variant="outlined"
                        type="password"
                        sx={{
                            input: { color: 'white' },
                            label: { color: 'gray' },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: 'gray' },
                                '&:hover fieldset': { borderColor: '#f97316' }, // orange-500
                                '&.Mui-focused fieldset': { borderColor: '#f97316' },
                            },
                        }}
                    />
                    <Button variant="contained" onClick={connect} sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}>Connect</Button>
                    <div className="w-[400px] h-[300px] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                        <video ref={localVideoref} autoPlay muted className="w-full h-full object-cover"></video>
                    </div>
                </div>
            ) : (
                <div className="relative w-full h-screen overflow-hidden bg-gray-950">

                    {/* Chat Modal */}
                    {showModal && (
                        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-50 flex flex-col shadow-2xl transition-transform duration-300">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h1 className="text-xl font-bold text-orange-500">Chat Room</h1>
                                <IconButton onClick={() => setModal(false)} className="text-gray-400 hover:text-white">
                                    <ChatIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length > 0 ? (
                                    messages.map((item, index) => (
                                        <div key={index} className={`flex flex-col ${item.sender === username ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${item.sender === username
                                                ? 'bg-orange-600 text-white rounded-tr-none'
                                                : 'bg-gray-700 text-gray-100 rounded-tl-none'
                                                }`}>
                                                <p className="text-xs opacity-70 mb-1 font-semibold">{item.sender}</p>
                                                <p className="text-sm">{item.data}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500">
                                        <p>No messages yet. Start chatting!</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-800 bg-gray-900">
                                <div className="flex gap-2">
                                    <TextField
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        sx={{
                                            input: { color: 'white' },
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: '#1f2937', // gray-800
                                                borderRadius: '20px',
                                                '& fieldset': { border: 'none' },
                                            },
                                        }}
                                    />
                                    <Button variant="contained" onClick={sendMessage} sx={{ borderRadius: '20px', bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video Grid */}
                    <div className={`w-full h-full p-4 grid gap-4 pb-24 overflow-y-auto content-center ${getGridClass(videos.length + 1)}`}>
                        {/* Local Video - PiP style or Grid */}
                        <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg ring-2 ring-orange-500/50 group w-full max-w-full">
                            <video className="w-full h-full object-cover transform scale-x-[-1]" ref={localVideoref} autoPlay muted></video>

                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-semibold truncate max-w-[80%]">{username} (You)</div>

                            {/* Local Hand Raise Badge */}
                            {handRaised && (
                                <div className="absolute top-2 right-2 bg-yellow-500 p-1 rounded-full shadow-lg animate-bounce">
                                    <PanToolIcon sx={{ fontSize: 20, color: 'black' }} />
                                </div>
                            )}

                            {/* Local Reactions Overlay */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {reactions.filter(r => r.socketId === socketIdRef.current).map(reaction => (
                                    <div key={reaction.id} className="absolute bottom-10 left-1/2 text-4xl animate-float-up">
                                        {reaction.emoji}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Remote Videos */}
                        {videos.map((video) => (
                            <div key={video.socketId} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video shadow-lg w-full max-w-full">
                                <video
                                    className={`w-full h-full object-cover ${video.video === false ? 'hidden' : ''}`}
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                            ref.play().catch(e => console.error("Autoplay failed:", e));
                                        }
                                    }}
                                    autoPlay
                                    playsInline // Important for mobile
                                ></video>
                                {video.video === false && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                        <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                            <p className="text-2xl font-bold text-gray-500 uppercase">{video.username?.[0] || "U"}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-semibold flex items-center gap-2 truncate max-w-[80%]">
                                    {video.username}
                                    {video.audio === false && <MicOffIcon fontSize="small" color="error" />}
                                </div>

                                {/* Remote Hand Raise Badge */}
                                {video.handRaised && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 p-1 rounded-full shadow-lg animate-bounce">
                                        <PanToolIcon sx={{ fontSize: 20, color: 'black' }} />
                                    </div>
                                )}

                                {/* Remote Reactions Overlay */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {reactions.filter(r => r.socketId === video.socketId).map(reaction => (
                                        <div key={reaction.id} className="absolute bottom-10 left-1/2 text-4xl animate-float-up">
                                            {reaction.emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Controls Bar - Responsive width */}
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur border border-gray-700 px-4 py-3 rounded-full shadow-2xl flex gap-3 md:gap-6 items-center z-40 max-w-[95%] overflow-x-auto no-scrollbar scroll-smooth">
                        <IconButton onClick={() => setVideo(!video)} className={`${!video ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}>
                            {video ? <VideocamIcon sx={{ color: 'white' }} /> : <VideocamOffIcon sx={{ color: 'white' }} />}
                        </IconButton>

                        <IconButton onClick={() => setAudio(!audio)} className={`${!audio ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}>
                            {audio ? <MicIcon sx={{ color: 'white' }} /> : <MicOffIcon sx={{ color: 'white' }} />}
                        </IconButton>

                        <div className="h-8 w-[1px] bg-gray-600 mx-1 md:mx-2 shrink-0"></div>

                        {/* Hand Raise Toggle */}
                        <IconButton onClick={toggleHand} className={`${handRaised ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}>
                            <PanToolIcon sx={{ color: handRaised ? 'black' : 'white' }} />
                        </IconButton>

                        {/* Reaction Menu */}
                        <div className="relative">
                            <IconButton onClick={() => setShowReactions(!showReactions)} className="bg-gray-700 hover:bg-gray-600 transition-colors">
                                <AddReactionIcon sx={{ color: 'white' }} />
                            </IconButton>
                            {showReactions && (
                                <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700 p-2 rounded-full shadow-xl flex gap-1 animate-slide-up">
                                    {emojis.map(emoji => (
                                        <button key={emoji} onClick={() => sendReaction(emoji)} className="text-2xl hover:scale-125 transition-transform p-1">
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-[1px] bg-gray-600 mx-1 md:mx-2 shrink-0"></div>

                        {screenAvailable && (
                            <IconButton onClick={() => setScreen(!screen)} className={`${screen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}>
                                {screen ? <ScreenShareIcon sx={{ color: 'white' }} /> : <StopScreenShareIcon sx={{ color: 'white' }} />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} color="error">
                            <IconButton onClick={() => setModal(!showModal)} className={`${showModal ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-700 hover:bg-gray-600'} transition-colors`}>
                                <ChatIcon sx={{ color: 'white' }} />
                            </IconButton>
                        </Badge>

                        <div className="h-8 w-[1px] bg-gray-600 mx-1 md:mx-2 shrink-0"></div>

                        <IconButton
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert("Invite link copied to clipboard!");
                            }}
                            className="bg-gray-700 hover:bg-gray-600 transition-colors tooltip shrink-0"
                            title="Copy Invite Link"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" /></svg>
                        </IconButton>

                        <IconButton onClick={() => window.location.href = "/"} className="bg-red-600 hover:bg-red-700 transition-colors shrink-0">
                            <CallEndIcon sx={{ color: 'white' }} />
                        </IconButton>
                    </div>

                </div>
            )}
        </div>
    );
}



// Animation Styles
const styleTag = document.createElement("style");
styleTag.innerHTML = `
@keyframes float-up {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
}
.animate-float-up {
  animation: float-up 2s ease-out forwards;
}
@keyframes slide-up {
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
}
.animate-slide-up {
    animation: slide-up 0.2s ease-out forwards;
}
`;
document.head.appendChild(styleTag);

// Helper to calculate grid cols based on user count
function getGridClass(count) {
    if (count <= 1) return "grid-cols-1 md:max-w-3xl md:mx-auto"; // Single user: full width mobile, constrained desktop
    if (count === 2) return "grid-cols-1 md:grid-cols-2";  // Two users: stacked mobile, side-by-side desktop
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2";   // 3-4 users: 1 col mobile, 2 col tablet/desktop
    if (count <= 6) return "grid-cols-2 md:grid-cols-3";   // 5-6 users: 2 col mobile, 3 col desktop
    return "grid-cols-2 md:grid-cols-4";                   // 7+ users
}