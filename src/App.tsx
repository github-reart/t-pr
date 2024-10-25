/**
 * Мониторинг PR
 * 
 * Copyright (C) 2024. Разработано в компании «Реарт»
 * reart.ru
 */

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="main">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Content />} />
              <Route path="/news" element={<News />} />
              <Route path="/add-news/:id?" element={<AddNews />} />
              <Route path="/stat" element={<Stat />} />
              <Route path="/planned" element={<Planned />} />
              <Route path="/table" element={<Table />} />
              <Route path="/chart" element={<Chart />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
