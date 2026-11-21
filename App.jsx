import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Invitation from './Invitation.jsx';
import Admin from './Admin.jsx';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/i/:slug" element={<Invitation />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
