import type { User } from "./types.ts";

let users: User[] = [];

function addUser(user: User) {
  users.push(user);
}

function removeUser(id: string) {
  users = users.filter((user) => user.id !== id);
}

function getUser(id: string) {
  return users.find((user) => user.id === id);
}

function getUsers({ roomId }: { roomId: string }) {
  return users.filter((user) => user.roomId === roomId);
}

export { addUser, removeUser, getUser, getUsers };
