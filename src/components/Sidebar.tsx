import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartSimple, faUser, faCirclePlus, faCalendarPlus, faTableList, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';
import { useUserContext } from './UserContext';
import { fetchData } from '../api';

interface SidebarProps {
  isAuthenticated: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAuthenticated }) => {
  const [isSubMenuVisible, setSubMenuVisible] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, user, setUserData } = useUserContext();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const authenticate = async () => {
    const storedUsername = localStorage.getItem('user');
    const storedPassword = localStorage.getItem('pass');

    if (storedUsername && storedPassword) {
      try {
        const result = await fetchData('/api/auth', 'POST', { name: storedUsername, pass: storedPassword });
        if (result.success) {
          setUserData(result.user.name, result.user.id, result.user.pass);
        }
      } catch (error) {
        console.error('Ошибка при входе:', error);
      }
    }
  };

  useEffect(() => {
    authenticate();
  }, [setUserData]);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => ('00' + b.toString(16)).slice(-2)).join('');
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
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Ошибка при входе:', err);
      alert('Неверные учетные данные');
    }
  };

  const handleLogout = () => {
    setUserData(null, null, null);
    localStorage.clear();   
    navigate('/');
    window.location.reload();
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleOpenModal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const isActive = (path: string) => location.pathname === path;

  const renderLinks = () => {
    return (
      <>
        <Link to="/news" className={`sidebar-button ${isActive('/news') ? 'active' : ''}`} title="Новости">
          <FontAwesomeIcon icon={faHome} />
        </Link>
        <Link to="/add-news" className={`sidebar-button ${isActive('/add-news') ? 'active' : ''}`} title="Добавить новость">
          <FontAwesomeIcon icon={faCirclePlus} />
        </Link>
        <Link to="/planned" className={`sidebar-button ${isActive('/planned') ? 'active' : ''}`} title="Добавить плановое значение">
          <FontAwesomeIcon icon={faCalendarPlus} />
        </Link>
      </>
    );
  };

  return (
    <div className="sidebar">
      {isAuthenticated && renderLinks()}
      <div className={`sidebar-button ${isSubMenuVisible ? 'active' : ''}`} 
           onMouseEnter={() => setSubMenuVisible(true)} 
           onMouseLeave={() => setSubMenuVisible(false)}>
        <FontAwesomeIcon icon={faChartSimple} />
        {isSubMenuVisible && (
          <div className="sub-menu">
            <h3>Статистика</h3>
            <Link to="/stat?sbyt" className="sidebar-link">Сбыт</Link>
            <Link to="/stat?gen" className="sidebar-link">Генерация</Link>
          </div>
        )}
      </div>
      <Link to="/table" className={`sidebar-button ${isActive('/table') ? 'active' : ''}`} title="Таблица информационной активности">
        <FontAwesomeIcon icon={faTableList} />
      </Link>
      <Link to="/chart" className={`sidebar-button ${isActive('/chart') ? 'active' : ''}`} title="График информационной активности">
        <FontAwesomeIcon icon={faChartLine} />
      </Link>

      {isAuthenticated && userId === 1 && location.pathname !== '/user' && (
        <Link to="/user" className={`sidebar-button ${isActive('/user') ? 'active' : ''}`} title="Список пользователей">
          <FontAwesomeIcon icon={faUser} />
        </Link>
      )}

      {(userId !== 1 || location.pathname === '/user') && (
        <Link to="#" className="sidebar-button" title="Авторизация" onClick={handleOpenModal}>
          <FontAwesomeIcon icon={faUser} />
        </Link>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false}
      >
        <button className="modal-close" onClick={() => setModalOpen(false)}>✖</button>
        <div className="user-block">
          {user ? (
            <div>
              <h2>Добро пожаловать, {user}</h2>
              <button onClick={handleLogout}>Выйти</button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <h2>Авторизация</h2>
              <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={toggleShowPassword}
                />
                показать пароль
              </label>
              <button type="submit">Войти</button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Sidebar;
