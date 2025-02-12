// "taskkill /f /im node.exe" if port is already in use

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Http2Server } from "http2";
import { Server, Socket } from "socket.io";
import { addUser, getUser, getUsers, removeUser } from "./data.js";

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

function joinRoom(socket: Socket, name: string, roomId: string) {
  socket.join(roomId);
  socket.to(roomId).emit("room-joined", { roomId, name });
  addUser({ id: socket.id, name, roomId });
  const users = getUsers({
    roomId,
  });

  io.to(roomId).emit("update-members", users);
}

function handleDisconnect(socket: Socket) {
  const user = getUser(socket.id);
  if (!user) return;
  removeUser(socket.id);
  const users = getUsers({
    roomId: user.roomId,
  });
  io.to(user.roomId).emit("update-members", users);
}

io.on("connection", (socket) => {
  socket.on("join-room", ({ name, roomId }) => {
    joinRoom(socket, name, roomId);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });
});
