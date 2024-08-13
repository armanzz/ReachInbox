import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import OneboxPage from './components/OneboxPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/google-login" element={<OneboxPage />} />
        <Route path="/onebox" element={<OneboxPage />} /> {/* Added /onebox route */}
      </Routes>
    </Router>
  );
}

export default App;
