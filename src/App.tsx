/**
 * Мониторинг PR
 * 
 * Copyright (C) 2024. Разработано в компании «Реарт»
 * reart.ru
 */
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './pages/Content';
import News from './pages/News';
import AddNews from './pages/AddNews';
import Stat from './pages/Stat';
import Planned from './pages/Planned';
import Table from './pages/Table';
import Chart from './pages/Chart';
import User from './pages/User';
import { UserProvider, useUserContext } from './components/UserContext';
import { fetchData } from './api';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { setUserData } = useUserContext();

  React.useEffect(() => {
    const authenticate = async () => {
      const username = localStorage.getItem('user');
      const hashedPassword = localStorage.getItem('pass');

      if (username && hashedPassword) {
        try {
          const result = await fetchData('/api/auth', 'POST', { name: username, pass: hashedPassword });

          if (result?.success) {
            setIsAuthenticated(true);
            setUserData(result.user.name, result.user.id, result.user.pass);
          }
        } catch (err) {
          console.error('Ошибка при входе:', err);
        }
      }
      setLoading(false); // Завершаем загрузку
    };

    authenticate();
  }, [setUserData]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main">
          <Sidebar isAuthenticated={isAuthenticated} />
          <div className="content">
            <Routes>
              <Route path="/user" element={<User setIsAuthenticated={setIsAuthenticated} />} />
              {isAuthenticated && (
                <>
                  <Route path="/" element={<Content />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/add-news/:id?" element={<AddNews />} />
                </>
              )}
                <Route path="/stat" element={<Stat />} />
                <Route path="/planned" element={<Planned />} />
                <Route path="/table" element={<Table />} />
                <Route path="/chart" element={<Chart />} />
                <Route path="/" element={<Navigate to="/chart" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

const MainApp: React.FC = () => (
  <UserProvider>
    <App />
  </UserProvider>
);

export default MainApp;
