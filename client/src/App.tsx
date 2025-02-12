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

  const handleJoinRoom = () => {
    socket.emit("join-room", { name, roomId });
    setJoinedRoom(true);
  };

  useEffect(() => {
    socket.on(
      "room-joined",
      ({ roomId, name }: { roomId: string; name: string }) => {
        console.log(`Room joined: ${roomId} as ${name}`);
      }
    );

    socket.on("update-members", (members: User[]) => {
      setMembers(members);
    });

    return () => {
      socket.off("room-joined");
      socket.off("update-members");
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
        <div>
          <h1>Members</h1>
          <ul>
            {members.map((member) => (
              <li key={member.id}>{member.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
