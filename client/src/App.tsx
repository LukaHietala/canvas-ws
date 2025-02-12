import "./App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";
import { Button } from "./components/ui/button";

interface EventsProps {
  events: string[];
}

function Events({ events }: EventsProps) {
  return (
    <section>
      <h3>Event Log</h3>
      <ul>
        {events.map((event, index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [events, setEvents] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [typing, setTyping] = useState<string>("");

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onEvent = (value: string) => setEvents((prev) => [...prev, value]);
    const onTyping = (value: string) => setTyping(value);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("event", onEvent);
    socket.on("typing", onTyping);
    socket.on("typing_stop", () => setTyping(""));

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("event", onEvent);
      socket.off("typing", onTyping);
      socket.off("typing_stop");
    };
  }, []);

  const handleConnect = () => socket.connect();
  const handleDisconnect = () => socket.disconnect();
  const handleSendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    socket.emit("event", `${name}: ${message}`);
    setMessage("");
  };

  const handleTyping = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
    socket.emit("typing", name || "Someone");
  };

  return (
    <div>
      <Button variant="default" size="default">
        df
      </Button>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <main>
        <div>
          <button onClick={handleConnect}>Connect</button>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>

        <Events events={events} />

        <form>
          <div>
            <label htmlFor="nameInput">Name:</label>
            <input
              id="nameInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="messageInput">Message:</label>
            <input
              id="messageInput"
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Enter your message"
            />
          </div>
          <button onClick={handleSendMessage}>Send Message</button>
        </form>

        {typing && <div>{typing} is typing...</div>}
      </main>
    </div>
  );
}
