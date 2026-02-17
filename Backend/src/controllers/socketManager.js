import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-call", (path, username, password) => {
      console.log(`[JOIN-CALL] Socket ${socket.id} requesting to join room: ${path} as ${username}`);

      // Initialize room if not exists
      if (connections[path] === undefined) {
        connections[path] = [];
        // Store password for the room if provided (first user sets it)
        if (password) {
          messages[path] = messages[path] || []; // ensure messages array exists
          // We can store room metadata in a separate object or attach to connections
          connections[path].password = password;
        }
      }

      // Password Validation
      const roomPassword = connections[path].password;
      if (roomPassword && roomPassword !== password) {
        console.log(`[JOIN-CALL] FAILED: Incorrect password for room ${path}`);
        io.to(socket.id).emit("error", { message: "Invalid Password" });
        return; // Stop execution, don't join
      }

      // Join the room
      socket.join(path);

      // Store user info
      connections[path].push({ id: socket.id, username: username });
      timeOnline[socket.id] = new Date();

      // Broadcast to everyone in the room (including self if needed, but usually others)
      // Notify others that a new user joined
      // Format: (newUserId, listOfAllUsers, newUsername)
      // Note: In Mesh, existing users need to know the new user to initiate offers (or vice versa).
      // Emitting to the ROOM notifies everyone.
      io.to(path).emit("user-joined", socket.id, connections[path], username);

      console.log(`[JOIN-CALL] SUCCESS: ${username} (${socket.id}) joined room ${path}. Total users: ${connections[path].length}`);
      // Debug: print all rooms
      // console.log("Current Rooms:", io.sockets.adapter.rooms);

      // Send chat history to the joining user
      if (messages[path]) {
        messages[path].forEach(msg => {
          // Check if msg has data before emitting to avoid errors
          if (msg.data) {
            socket.emit(
              "chat-message",
              msg.data,
              msg.sender,
              msg['socket-id-sender']
            );
          }
        });
      }
    });

    socket.on("signal", (toId, message) => {
      console.log(`[SIGNAL] From ${socket.id} to ${toId}`);
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      // Find room(s) this socket is in
      // filtering out the socket's own ID room
      const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
      console.log(`[CHAT] From ${sender} (${socket.id}) in rooms: ${rooms.join(", ")}`);

      if (rooms.length > 0) {
        const room = rooms[0]; // Assuming one room per user for now

        console.log(`[CHAT] Broadcasting to room ${room}: ${data}`);

        if (!messages[room]) {
          messages[room] = [];
        }

        messages[room].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        // Broadcast to room
        io.to(room).emit("chat-message", data, sender, socket.id);
      } else {
        console.log(`[CHAT] FAILED: User ${socket.id} is not in any room!`);
      }
    });

    socket.on("toggle-media", (kind, enabled, room) => {
      // We can use the room passed from client, or find it from socket.rooms
      // Using client-passed room for reliability if they are properly syncing state
      io.to(room).emit("media-toggled", socket.id, kind, enabled);
    });

    socket.on("toggle-hand", (isRaised, room) => {
      io.to(room).emit("hand-toggled", socket.id, isRaised);
    });

    socket.on("reaction", (emoji, room) => {
      io.to(room).emit("reaction-received", socket.id, emoji);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Calculate time online
      if (timeOnline[socket.id]) {
        const diffTime = Math.abs(new Date() - timeOnline[socket.id]);
        console.log(`User ${socket.id} was online for ${diffTime} ms`);
        delete timeOnline[socket.id];
      }

      // Find which rooms the user was in from our local store (since socket.rooms is empty on disconnect)
      // We iterate our connections object to clean up
      for (const [room, users] of Object.entries(connections)) {
        const index = users.findIndex(u => u.id === socket.id);
        if (index !== -1) {
          users.splice(index, 1);
          connections[room] = users;

          // Notify remaining users
          io.to(room).emit("user-left", socket.id);

          if (connections[room].length === 0) {
            delete connections[room];
          }
        }
      }
    });
  });

  return io;
};