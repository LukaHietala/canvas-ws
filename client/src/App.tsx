import "./App.css";
import { useState, useEffect } from "react";
import { socket } from "./socket";

import RoomSelector from "./components/ui/RoomSelector";

type User = {
  id: string;
  name: string;
  roomId: string;
};

export default function App() {
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false);

  const [members, setMembers] = useState<User[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  function handleJoinRoom() {
    socket.emit("join-room", { name, roomId });
    setJoinedRoom(true);
  }

  function handleLeaveRoom() {
    socket.emit("leave-room", { roomId });
    setJoinedRoom(false);
  }

  useEffect(() => {
    socket.on(
      "room-joined",
      ({ name, roomId }: { name: string; roomId: string }) => {
        setEvents((prevEvents) => [
          ...prevEvents,
          `${name} joined room ${roomId}`,
        ]);
      }
    );

    socket.on(
      "room-left",
      ({ name, roomId }: { name: string; roomId: string }) => {
        setEvents((prevEvents) => [
          ...prevEvents,
          `${name} left room ${roomId}`,
        ]);
      }
    );

    socket.on("update-members", (members: User[]) => {
      setMembers(members);
    });

    socket.on("invalid-data", (error: string) => {
      console.error(error);
    });

    return () => {
      socket.off("room-joined");
      socket.off("update-members");
      socket.off("room-left");
      socket.off("invalid-data");
    };
  }, []);

  return (
    <div>
      {!joinedRoom && (
        <RoomSelector
          handleJoinRoom={handleJoinRoom}
          name={name}
          roomId={roomId}
          setName={setName}
          setRoomId={setRoomId}
          room={roomId}
        />
      )}
      {joinedRoom && (
        <div className="flex flex-row space-x-6">
          <section>
            <h2>Members</h2>
            <ul>
              {members.map((member) => (
                <li key={member.id}>{member.name}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>actions</h2>
            <button onClick={handleLeaveRoom} className="hover:cursor-pointer">
              Leave room
            </button>
          </section>
          <section>
            <h2>events</h2>
            <ul>
              {events.map((event, index) => (
                <li key={index}>{event}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
