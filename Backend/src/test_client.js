import { io } from "socket.io-client";

const socket = io("https://vcall-real-time-video-conferencing-web-ew4s.onrender.com");

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    socket.emit("join-call", "https://virtualcall.netlify.app/room1", "TestUser");
});

socket.on("user-joined", (id, users, username) => {
    console.log("User joined:", username, users);
    socket.disconnect();
});

socket.on("disconnect", () => {
    console.log("Disconnected");
});

socket.on("connect_error", (err) => {
    console.log("Connection Error:", err.message);
});
