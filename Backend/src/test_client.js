import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
    socket.emit("join-call", "http://localhost:5173/room1", "TestUser");
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
