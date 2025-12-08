import WebSocket from "ws";

const ws = new WebSocket("ws://127.0.0.1:5000");

ws.on("open", () => {
   console.log("WS connected!");

   ws.send(JSON.stringify({ type: "join", roomId: "testRoom" }));
   ws.send(JSON.stringify({ type: "chat", roomId: "testRoom", text: "Hello!" }));
});

ws.on("message", (data) => {
   console.log("SERVER:", data.toString());
});
