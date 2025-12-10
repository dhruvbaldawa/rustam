// ABOUTME: Main app component with routing setup
// ABOUTME: Initializes Firebase auth and routes to Home, Host, and Player flows

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { Lobby } from './pages/host/Lobby';
import { Join } from './pages/player/Join';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Lobby />} />
        <Route path="/play" element={<Join />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
