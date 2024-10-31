import React, { useState } from 'react';
import { userData, UserData } from '../userData';

interface UserProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const User: React.FC<UserProps> = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [user, setUser] = useState<string | null>(localStorage.getItem('user'));
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [passwords, setPasswords] = useState<{ [key: number]: string }>({});

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser: UserData | undefined = userData.find(user => user.name === username);

    if (foundUser) {
      const hashedPassword = await hashPassword(password);
      if (hashedPassword === foundUser.pass) {
        setUser(foundUser.name);
        localStorage.setItem('user', foundUser.name);
        localStorage.setItem('pass', foundUser.pass);
        setIsAuthenticated(true);
//        window.location.href = '/news';
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
    localStorage.removeItem('pass');
    setIsAuthenticated(false);
  };

  const handleChangePassword = async (id: number) => {
    const newPassword = passwords[id];
    const hashedPassword = await hashPassword(newPassword);
    const userToUpdate = userData.find(user => user.id === id);
    if (userToUpdate) {
      userToUpdate.pass = hashedPassword;
      setPasswords({ ...passwords, [id]: '' }); // Сбросить поле ввода
      alert('Пароль изменен.');
    }
  };

  const handleDeleteUser = (id: number) => {
    const index = userData.findIndex(user => user.id === id);
    if (index !== -1) {
      userData.splice(index, 1);
      alert('Пользователь удален.');
      window.location.href = '/user';
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const hashedPassword = await hashPassword(newUserPassword);
    const newUser: UserData = {
      id: userData.length + 1, // Присваиваем новый id
      name: newUserName,
      pass: hashedPassword
    };
    userData.push(newUser);
    setNewUserName('');
    setNewUserPassword('');
    alert('Пользователь добавлен.');
  };

  const adminBlock = () => {
    return (
      <div className="admin-block">
      <h3>Список пользователей</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Новый пароль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {userData.filter(u => u.name !== user).map(({ id, name }) => (
            <tr key={id}>
              <td>{id}</td>
              <td>{name}</td>
              <td>
                <input
                  type="password"
                  value={passwords[id] || ''}
                  onChange={(e) => setPasswords({ ...passwords, [id]: e.target.value })}
                  placeholder="Новый пароль"
                />
              </td>
              <td>
                <button className="user-change" onClick={() => handleChangePassword(id)}>Сменить</button>
                <button className="user-del" onClick={() => handleDeleteUser(id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Добавить нового пользователя</h3>
      <form className="userAddBlock" onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Логин"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          required
        />
        <button type="submit">Добавить</button>
      </form>
      </div>
    );
  };


  return (
    <div className="user-form">
      {user ? (
        <div>
          <h2>Добро пожаловать, {user}</h2>
          <button onClick={handleLogout}>Выйти</button>
          {userData.find(u => u.id === 1 && u.name === user) && adminBlock()}
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
