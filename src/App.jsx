import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SignupPage from './pages/Signup';
import LoginPage from './pages/Login'; // fixed import
import Display from './pages/Display';
import Contact from './pages/display pages/Contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/Display" element={<Display />} />

      </Routes>
    </Router>
  );
}

export default App;
