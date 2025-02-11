import "./App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";

interface EventsProps {
  events: string[];
}

function Events({ events }: EventsProps) {
  return (
    <ul>
      {events.map((event, index) => (
        <li key={index}>{event}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [events, setEvents] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  function sendMessage({ name, message }: { name: string; message: string }) {
    socket.emit("event", `${name}: ${message}`);
  }

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onEvent(value: string) {
      setEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("event", onEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("event", onEvent);
    };
  }, []);

  return (
    <div>
      {isConnected ? "Connected" : "Disconnected"}
      <Events events={events} />
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
      <button
        onClick={() => {
          sendMessage({
            name,
            message,
          });
        }}
      >
        Send message
      </button>
      <label htmlFor="text">Name:</label>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label htmlFor="text">Message:</label>
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
    </div>
  );
}
