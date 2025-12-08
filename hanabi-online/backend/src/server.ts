import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

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
