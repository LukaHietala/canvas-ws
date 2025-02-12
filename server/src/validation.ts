import { z } from "zod";

export const JoinRoomSchema = z.object({
  name: z.string().min(1).max(20),
  roomId: z.string().min(4).max(20),
});
