import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
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

type ShowPasswordKeys = 'newUser' | number;

const User: React.FC<UserProps> = () => {
  const { user, userId, pass } = useUserContext();
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [passwords, setPasswords] = useState<{ [key: number]: string }>({});
  
  const [showPassword, setShowPassword] = useState<{
    newUser: boolean;
    users: { [key: number]: boolean };
  }>({
    newUser: false,
    users: {}
  });

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('');
  };

  const fetchUsers = async (user: string, pass: string) => {
    try {
      const data: UserData[] = await fetchData('/api/users/list', 'POST', { adminName: user, adminPass: pass });
      setUsers(data);
    } catch (err) {
      console.error('Ошибка при получении пользователей:', err);
    }
  };

  useEffect(() => {
    if (userId === 1 && user && pass) {
      fetchUsers(user, pass);
    }
  }, [user, pass, userId]);

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

  const toggleShowPassword = (key: ShowPasswordKeys) => {
    setShowPassword(prev => {
      if (typeof key === "string") {
        return { ...prev, [key]: !prev[key] };
      } else {
        return { 
          ...prev, 
          users: {
            ...prev.users,
            [key]: !prev.users[key]
          }
        };
      }
    });
  };

  const adminBlock = () => {
    return (
      <>
        <h3>Добавить нового пользователя</h3>
        <form className="user-add" onSubmit={handleAddUser}>
          <input
            type="text"
            placeholder="Логин"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />
          <input
            type={showPassword.newUser ? 'text' : 'password'}
            placeholder="Пароль"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={showPassword.newUser}
              onChange={() => toggleShowPassword('newUser')}
            />
            показать 
          </label>
          <button type="submit"><FontAwesomeIcon icon={faCirclePlus} /> Добавить</button>
        </form>

        <h3>Список пользователей</h3>
        <table className="user-table">
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
                    type={showPassword.users[id] ? 'text' : 'password'}
                    value={passwords[id] || ''}
                    onChange={(e) => setPasswords({ ...passwords, [id]: e.target.value })}
                    placeholder="Новый пароль"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={showPassword.users[id] || false}
                      onChange={() => toggleShowPassword(id)}
                    />
                    показать
                  </label>
                </td>
                <td>
                  <button className="user-change" onClick={() => handleChangePassword(id)}>Сменить</button>
                  <button className="user-del" onClick={() => handleDeleteUser(id)}><FontAwesomeIcon icon={faTrashAlt} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <>
      <div className="admin-block">
        {userId === 1 && adminBlock()}
      </div>
    </>
  );
};

export default User;
