import React, { useState } from 'react';
import { userData, UserData } from '../userData';
import bcrypt from 'bcryptjs';

interface UserProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const User: React.FC<UserProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<string | null>(localStorage.getItem('user'));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser: UserData | undefined = userData.find(user => user.name === username);

    if (foundUser && bcrypt.compareSync(password, foundUser.pass)) {
      setUser(foundUser.name);
      localStorage.setItem('user', foundUser.name);
      localStorage.setItem('pass', password); // Сохраняем пароль в открытом виде
      setIsAuthenticated(true); // Устанавливаем авторизацию в родительском компоненте
      window.location.href = '/news'; // перенаправление на главную страницу
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
