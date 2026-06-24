import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Builder from './pages/Builder';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Builder />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
