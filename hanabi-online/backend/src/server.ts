import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const io = new Server(server, {
  cors: { origin: "*" }
});

// тест
app.get("/", (_req, res) => {
  res.send("Hanabi backend is running");
});

// socket connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client left:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Backend listening on http://localhost:5000");
});

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.send("hello");

  ws.on("message", (msg) => {
    console.log("client says:", msg.toString());
  });

  ws.on("close", () => {
    console.log("WS client disconnected");
  });
});