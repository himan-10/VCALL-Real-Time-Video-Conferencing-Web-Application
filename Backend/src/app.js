import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
// import  connectToSocket from "./controllers/socketManager.js";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
//routes
import userRoutes from "./routes/users.routes.js";
// import { version } from "node:os";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = createServer(app); //express instance +socket server both connected
const io = connectToSocket(server); //then io new server connected to server

app.set("port", process.env.PORT || 8000);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ==============================middleware=================
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
/* Ye kyon use karte hain? 🤔
Isse API versioning kehte hain.
Matlab:
Same app
Different versions of API
Purana user break na ho*/
//  ===========================================api versioning=================================
app.use("/api/v1/users", userRoutes);
//sever
const start = async () => {
  //connect mongo
  const connectionDb = await mongoose.connect(
    process.env.MONGO_URI
  );
  console.log(`MONGO Connected DB Host:${connectionDb.connection.host}`);
  //io server start
  server.listen(app.get("port"), () => {
    console.log("server on port 8000");
  });
};
start();



// api version
/*
Simple words me

Socho tumhari API live hai:

/api/users/login


Bahut saare users already use kar rahe hain.

Ab tum:

response change karna chahte ho

new fields add karna chahte ho

logic update karna chahte ho

❌ Direct change → old apps crash

✅ Solution → API versioning
*/
/*
🧠 Interview-Ready Explanation (Hinglish)

“Cross-origin socket tab hota hai jab frontend aur backend alag origin par hote hain.
Browser security ke wajah se socket connection block ho jata hai.
Isko solve karne ke liye Socket.IO server me CORS configuration allow karte hain.”

🎤 Short One-Liner (Interview)

Cross-origin = different domain/port/protocol

CORS = browser ko permission dena

Socket.IO me CORS server side configure hota hai

🔥 Common Interview Follow-ups
❓ Why CORS is needed?

➡ Browser security ke liye.

❓ Is CORS a server or browser concept?

➡ Browser concept, server sirf headers bhejta hai.

❓ Does Postman face CORS?

➡ ❌ No (only browsers).

🏁 Real Project Example

React app → localhost:5173

Socket server → localhost:3000

CORS enabled → ✔ works perfectly*/ 