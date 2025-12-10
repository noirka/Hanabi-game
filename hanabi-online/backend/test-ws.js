import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:5000");

ws.on("open", () => {
   console.log("connected!");

   ws.send(JSON.stringify({ type: "join", roomId: "testRoom" }));
   ws.send(JSON.stringify({ type: "chat", roomId: "testRoom", text: "Hello!" }));
});
ws.on("message", data => console.log("server:", data.toString()));
