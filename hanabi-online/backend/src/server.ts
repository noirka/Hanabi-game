import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());

const server = http.createServer(app);

const rooms: Record<string, Set<WebSocket>> = {};

const wss = new WebSocketServer({ server });

const io = new Server(server, {
  cors: { origin: "*" }
});

app.get("/", (_req, res) => {
  res.send("Hanabi backend is running");
});

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

 ws.on("message", (data) => {
  try {
    const msg = JSON.parse(String(data));

    if (msg.type === "join") {
      const room = msg.roomId;
      if (!rooms[room]) rooms[room] = new Set();
      rooms[room].add(ws);

      console.log(`Client joined room: ${room}`);

      ws.send(JSON.stringify({ type: "joined", room }));
      return;
    }

    if (msg.roomId && rooms[msg.roomId]) {
      for (const client of rooms[msg.roomId]) {
        if (client !== ws) {
          client.send(JSON.stringify(msg));
        }
      }
         }
      } catch (e) {
         console.log("Bad WS message:", e);
      }
      });

      ws.on("close", () => {
      for (const room in rooms) {
         rooms[room].delete(ws);
      }
      });
});