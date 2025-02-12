import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Http2Server } from "http2";
import { Server, Socket } from "socket.io";
import { addUser, getUser, getUsers, removeUser } from "./data.js";
import { JoinRoomSchema } from "./validation.js";

const app = new Hono();
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
    origin: "*",
  },
});

const WS_EVENTS = {
  JOIN_ROOM: "join-room",
  DISCONNECT: "disconnect",
  LEAVE_ROOM: "leave-room",
} as const;

const WS_SUBTYPES = {
  ROOM_JOINED: "room-joined",
  UPDATE_MEMBERS: "update-members",
  ROOM_LEFT: "room-left",
  INVALID_DATA: "invalid-data",
} as const;

function joinRoom(socket: Socket, name: string, roomId: string) {
  const joinRoomData = JoinRoomSchema.safeParse({ name, roomId });

  if (!joinRoomData.success) {
    return socket.emit(
      WS_SUBTYPES.INVALID_DATA,
      "Invalid input data. Room ID must be between 4 and 20 characters, and name must be between 1 and 20 characters."
    );
  }

  socket.join(roomId);
  socket.to(roomId).emit(WS_SUBTYPES.ROOM_JOINED, { roomId, name });

  addUser({ id: socket.id, name, roomId });
  const users = getUsers({ roomId });

  io.to(roomId).emit(WS_SUBTYPES.UPDATE_MEMBERS, users);
}

function handleDisconnect(socket: Socket) {
  const user = getUser(socket.id);
  if (!user) return;

  removeUser(socket.id);
  const users = getUsers({ roomId: user.roomId });

  io.to(user.roomId).emit(WS_SUBTYPES.UPDATE_MEMBERS, users);
  socket
    .to(user.roomId)
    .emit(WS_SUBTYPES.ROOM_LEFT, { roomId: user.roomId, name: user.name });
}

function leaveRoom(socket: Socket, roomId: string) {
  const user = getUser(socket.id);
  if (!user) return;

  removeUser(socket.id);
  const users = getUsers({ roomId });

  socket.leave(roomId);
  io.to(roomId).emit(WS_SUBTYPES.UPDATE_MEMBERS, users);
  socket.to(roomId).emit(WS_SUBTYPES.ROOM_LEFT, { roomId, name: user.name });
}

io.on("connection", (socket) => {
  socket.on(WS_EVENTS.JOIN_ROOM, ({ name, roomId }) => {
    joinRoom(socket, name, roomId);
  });

  socket.on(WS_EVENTS.DISCONNECT, () => {
    handleDisconnect(socket);
  });

  socket.on(WS_EVENTS.LEAVE_ROOM, ({ roomId }) => {
    leaveRoom(socket, roomId);
  });
});
