export interface UserData {
  id: number;
  name: string;
  pass: string; // Храните как хеш, полученный с помощью SHA-256
}

// Функция для создания хеша пароля
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
};

export const userData: UserData[] = [
  { id: 1, name: "admin", pass: await hashPassword("admin") },
  { id: 2, name: "user", pass: await hashPassword("user") },
  { id: 3, name: "test", pass: await hashPassword("test") },
];
