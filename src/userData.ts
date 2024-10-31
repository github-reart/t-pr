export interface UserData {
  id: number;
  name: string;
  pass: string;
}

export const userData: UserData[] = [
  { id: 1, name: "admin", pass: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" },
  { id: 2, name: "user", pass: "04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb" },
  { id: 3, name: "test", pass: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" },
];
