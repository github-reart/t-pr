import React, { useState } from 'react';
import { userData, UserData } from '../userData';

interface UserProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const User: React.FC<UserProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<string | null>(localStorage.getItem('user'));

    // Функция для создания хеша пароля
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser: UserData | undefined = userData.find(user => user.name === username);
  
    if (foundUser) {
      const hashedPassword = await hashPassword(password);
      
      // Сравниваем хеши паролей
      if (hashedPassword === foundUser.pass) {
        console.log("Пароль успешно аутентифицирован.");
  
        setUser(foundUser.name);
        localStorage.setItem('user', foundUser.name);
        localStorage.setItem('pass', hashedPassword); // Сохраняем хеш пароля
        setIsAuthenticated(true); // Устанавливаем авторизацию в родительском компоненте
        window.location.href = '/news'; // Перенаправление на главную страницу
      } else {
        alert('Неверный логин или пароль');
      }
    } else {
      alert('Неверный логин или пароль');
    }
  };
  


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('pass'); // Удаляем пароль
    setIsAuthenticated(false); // Убираем авторизацию
    window.location.href = '/user'; // перенаправление обратно на авторизацию
  };

  return (
    <div className="user-form">
      {user ? (
        <div>
          <h2>Добро пожаловать, {user}</h2>
          <button onClick={handleLogout}>Выйти</button>
        </div>
      ) : (
        <form className="form" onSubmit={handleLogin}>
          <h2>Авторизация</h2>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Войти</button>
        </form>
      )}
    </div>
  );
};

export default User;
