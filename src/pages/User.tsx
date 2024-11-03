import React, { useEffect, useState } from 'react';
import { useUserContext } from '../components/UserContext';
import { fetchData } from '../api';

interface UserData {
  id: number;
  name: string;
  pass: string;
}

interface UserProps {
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const User: React.FC<UserProps> = ({ setIsAuthenticated }) => {
  const { user, userId, pass, setUserData } = useUserContext();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
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
    const hashedPassword = await hashPassword(password);
    try {
      const result = await fetchData('/api/auth', 'POST', { name: username, pass: hashedPassword });
  
      if (result.success) {
        setUserData(result.user.name, result.user.id, result.user.pass);
        localStorage.setItem('user', result.user.name);
        localStorage.setItem('pass', result.user.pass);
        setIsAuthenticated(true);
        
        if (result.user.id === 1) {
          await fetchUsers(result.user.name, result.user.pass);
        }        
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      alert('Неверные учетные данные');
    }
  };
  

  const fetchUsers = async (name: string, pass: string) => {
    try {
      const data: UserData[] = await fetchData('/api/users/list', 'POST', { adminName: name, adminPass: pass });
      setUsers(data);
    } catch (err) {
      console.error('Ошибка при получении пользователей:', err);
    }
  };

  useEffect(() => {
    if (userId === 1 && user && pass) {
      fetchUsers(user, pass);
    }
  }, [user, pass]);

  const handleLogout = () => {
    setUserData(null, null, null);
    localStorage.removeItem('user');
    localStorage.removeItem('pass');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');    
  };

  const handleChangePassword = async (id: number) => {
    const newPassword = passwords[id];
    const hashedPassword = await hashPassword(newPassword);
    try {
      await fetchData('/api/users/ch', 'POST', { id, pass: hashedPassword, adminName: user, adminPass: pass });
      setPasswords(prev => ({ ...prev, [id]: '' }));
      alert('Пароль изменен.');
    } catch (err) {
      console.error('Ошибка при изменении пароля:', err);
    }
  };

  const handleDeleteUser = async (id: number) => {
    const confirm = window.confirm('Вы уверены, что хотите удалить пользователя?');
    if (confirm) {
      try {
        await fetchData('/api/users/del', 'DELETE', { id, adminName: user, adminPass: pass });
        setUsers(users.filter(u => u.id !== id));
        alert('Пользователь удален.');
      } catch (err) {
        console.error('Ошибка при удалении пользователя:', err);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const hashedPassword = await hashPassword(newUserPassword);
    try {
      const newUser: UserData = await fetchData('/api/users/add', 'POST', { name: newUserName, pass: hashedPassword, adminName: user, adminPass: pass });
      setUsers(prev => [...prev, newUser]);
      setNewUserName('');
      setNewUserPassword('');
      alert('Пользователь добавлен.');
    } catch (err) {
      console.error('Ошибка при добавлении пользователя:', err);
    }
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
            {users.filter(u => u.name !== user).map(({ id, name }) => (
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
          {userId === 1 && adminBlock()}
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
