// ABOUTME: Main app component with routing setup
// ABOUTME: Initializes Firebase auth and routes to Home, Host, and Player flows

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RoomProvider } from './contexts/RoomContext';
import { Home } from './pages/Home';
import { Lobby } from './pages/host/Lobby';
import { Game } from './pages/host/Game';
import { HostGameOver } from './pages/host/GameOver';
import { Join } from './pages/player/Join';
import { Waiting } from './pages/player/Waiting';
import { RoleReveal } from './pages/player/RoleReveal';
import { RustamRevealed } from './pages/player/RustamRevealed';
import { GameOver } from './pages/player/GameOver';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 safe-area-top safe-area-bottom">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <RoomProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<Lobby />} />
          <Route path="/host/game" element={<Game />} />
          <Route path="/host/gameover" element={<HostGameOver />} />
          <Route path="/play" element={<Join />} />
          <Route path="/play/waiting" element={<Waiting />} />
          <Route path="/play/role" element={<RoleReveal />} />
          <Route path="/play/revealed" element={<RustamRevealed />} />
          <Route path="/play/gameover" element={<GameOver />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </RoomProvider>
  );
}

export default App;
