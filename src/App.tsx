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
import { userData } from './userData';
import bcrypt from 'bcryptjs';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedPassword = localStorage.getItem('pass');
    
    if (storedUser && storedPassword) {
      const foundUser = userData.find(user => user.name === storedUser);
      
      if (foundUser && bcrypt.compareSync(storedPassword, foundUser.pass)) {
        setIsAuthenticated(true);
      }
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main">
          <Sidebar isAuthenticated={isAuthenticated} /> {/* Передаем isAuthenticated в Sidebar */}
          <div className="content">
            <Routes>
              <Route path="/user" element={<User setIsAuthenticated={setIsAuthenticated} />} />
              {isAuthenticated ? (
                <>
                  <Route path="/" element={<Content />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/add-news/:id?" element={<AddNews />} />
                  <Route path="/stat" element={<Stat />} />
                  <Route path="/planned" element={<Planned />} />
                  <Route path="/table" element={<Table />} />
                  <Route path="/chart" element={<Chart />} />
                </>
              ) : (
                <Route path="/" element={<Navigate to="/user" />} />
              )}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;




