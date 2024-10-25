import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/images/logo.png';

const Header: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
    const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

    useEffect(() => {
      const intervalId = setInterval(() => {
        setCurrentTime(new Date().toLocaleTimeString());
        setCurrentDate(new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
      }, 1000);
  
      return () => clearInterval(intervalId);
    }, []);    
    
    return (
      <div className="header">
        <div className="logo">
        <Link to="/"><img className="logo-img" src={logoImage} alt="T+" /></Link>
          <span className="logo-text">Мониторинг PR Владимир - Иваново</span>
        </div>
        <div className="datetime">
          <span className="datetime-time">{currentTime}</span>
          <span className="datetime-date">{currentDate}</span>
        </div>
      </div>
    );
};

export default Header;
