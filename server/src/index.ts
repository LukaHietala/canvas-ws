// "taskkill /f /im node.exe" if port is already in use

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Http2Server } from "http2";
import { Server } from "socket.io";

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
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("event", (value) => {
    console.log(value);
    io.b("event", value);
  });
});
