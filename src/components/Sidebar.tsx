import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faChartSimple, faUser, faCirclePlus, faCalendarPlus, faTableList, faChartLine } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  isAuthenticated: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isAuthenticated }) => {
  const [isSubMenuVisible, setSubMenuVisible] = useState<boolean>(false);
  const location = useLocation();

  const toggleSubMenu = (): void => setSubMenuVisible(!isSubMenuVisible);

  const isActive = (path: string) => location.pathname === path;

  const isSubMenuActive = () => {
    return isActive('/sales') || isActive('/generation');
  };

  const getLinkClassName = (path: string) => {
    return isActive(path) ? 'sidebar-button active' : 'sidebar-button';
  };

  const user = localStorage.getItem('user');
  const renderLinks = () => {
    return (
      <>
        <Link to="/news" className={getLinkClassName('/news')} title="Новости">
          <FontAwesomeIcon icon={faHome} />
        </Link>
        <Link to="/add-news" className={getLinkClassName('/add-news')} title="Добавить новость">
          <FontAwesomeIcon icon={faCirclePlus} />
        </Link>
        <Link to="/planned" className={getLinkClassName('/planned')} title="Добавить плановое значение">
          <FontAwesomeIcon icon={faCalendarPlus} />
        </Link>
        <div className={`sidebar-button ${isSubMenuActive() ? 'active' : ''}`} onMouseEnter={toggleSubMenu} onMouseLeave={toggleSubMenu}>
          <FontAwesomeIcon icon={faChartSimple} />
          {isSubMenuVisible && (
            <div className="sub-menu">
              <h3>Статистика</h3>
              <Link to="/stat?sbyt" className="sidebar-link">Сбыт</Link>
              <Link to="/stat?gen" className="sidebar-link">Генерация</Link>
            </div>
          )}
        </div>
        <Link to="/table" className={getLinkClassName('/table')} title="Таблица информационной активности">
          <FontAwesomeIcon icon={faTableList} />
        </Link>
        <Link to="/chart" className={getLinkClassName('/chart')} title="График информационной активности">
          <FontAwesomeIcon icon={faChartLine} />
        </Link>
      </>
    );
  };

  return (
    <div className="sidebar">
      {isAuthenticated && renderLinks()}
      <Link to="/user" id="user-button" className={getLinkClassName('/user')} title="Авторизация">
        <FontAwesomeIcon icon={faUser} />
      </Link>
    </div>
  );
    
}

export default Sidebar;
