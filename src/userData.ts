import bcrypt from 'bcryptjs';

export interface UserData {
  id: number;
  name: string;
  pass: string;
}

export const userData: UserData[] = [
  { id: 1, name: "admin", pass: bcrypt.hashSync("admin", 10) },
  { id: 2, name: "user", pass: bcrypt.hashSync("user", 10) },
  { id: 3, name: "test", pass: bcrypt.hashSync("test", 10) },
];
