// UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  user: string | null;
  userId: number | null; // Обновлен тип на number | null
  pass: string | null;
  setUserData: (user: string | null, userId: number | null, pass: string | null) => void; // Обновлен тип userId
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null); // Обновлен тип на number | null
  const [pass, setPass] = useState<string | null>(null);

  const setUserData = (user: string | null, userId: number | null, pass: string | null) => {
    setUser(user);
    setUserId(userId); // Установка id пользователя
    setPass(pass);
  };

  return (
    <UserContext.Provider value={{ user, userId, pass, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
