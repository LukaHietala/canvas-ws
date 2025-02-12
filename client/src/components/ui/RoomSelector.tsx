import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoomSelectorProps = {
  name: string;
  setName: (name: string) => void;
  roomId: string;
  setRoomId: (roomId: string) => void;
  handleJoinRoom: () => void;
  room: string;
};

export default function RoomSelector({
  name,
  setName,
  roomId,
  setRoomId,
  handleJoinRoom,
}: RoomSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-md border border-neutral-300">
      <h1 className="text-lg font-medium text-left mb-4">Join a Room</h1>
      <div className="space-y-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="room-id">Room ID (Required for joining)</Label>
          <Input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-5">
          <Button onClick={handleJoinRoom} disabled={!name || !roomId}>
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
