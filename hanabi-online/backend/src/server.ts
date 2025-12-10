import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());

const server = http.createServer(app);

type Room = {
  clients: Set<WebSocket>;
  state: any; 
};

const rooms: Record<string, Room> = {};

const wss = new WebSocketServer({ server });

app.get("/", (_req, res) => {
  res.send("Hanabi backend is running");
});

server.listen(5000, () => {
  console.log("Backend listening on http://localhost:5000");
});

wss.on("connection", (ws) => {
  console.log("WS client connected");
  ws.send(JSON.stringify({ type: "hello" }));

  ws.on("message", (data) => {
    let msg: any;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }

    if (msg.type === "join") {
      const roomId = msg.roomId;

      if (!rooms[roomId]) {
        rooms[roomId] = {
          clients: new Set(),
          state: { log: [] }
        };
      }
      rooms[roomId].clients.add(ws);

      ws.send(JSON.stringify({
        type: "joined",
        room: roomId
      }));
      return;
    }

    if (msg.type === "chat") {
      const room = rooms[msg.roomId];
      if (!room) return;

      room.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "chat",
          text: msg.text
        }));
      });
      return;
    }

    if (msg.type === "state") {
      const room = rooms[msg.roomId];
      if (!room) return;

      room.state = msg.state;

      room.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "state",
          state: room.state
        }));
      });
      return;
    }
  });
});
