// "taskkill /f /im node.exe" if port is already in use

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Http2Server } from "http2";
import { Server, Socket } from "socket.io";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

const io = new Server(server as Http2Server, {
  path: "/",
  serveClient: false,
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  handleConnection(socket);
});

function handleConnection(socket: Socket) {
  console.log(`User connected: ${socket.id}`);
  broadcastEvent("a user connected");

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    broadcastEvent("a user disconnected");
  });

  // messages
  socket.on("event", (value: any) => {
    console.log(`Received event from ${socket.id}:`, value);
    broadcastEvent(value);
    io.emit("typing_stop");
  });

  let typingTimeout: NodeJS.Timeout | null = null;
  socket.on("typing", (username: string) => {
    console.log(`${username} is typing...`);
    io.emit("typing", `${username}`);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    typingTimeout = setTimeout(() => {
      io.emit("typing_stop");
      typingTimeout = null;
    }, 2000);
  });
}

// broadcast messages to all clients
function broadcastEvent(message: string) {
  io.emit("event", message);
}
