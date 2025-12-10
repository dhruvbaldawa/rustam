// ABOUTME: Host game over screen
// ABOUTME: Displays game end message and options to return home or create new room

import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

export const HostGameOver = () => {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  const handlePlayAgain = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  const handleCreateNewRoom = () => {
    leaveRoom();
    // Add a flag to prevent session restoration
    sessionStorage.setItem('skip_session_restore', 'true');
    navigate('/host', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Game Over</h1>
        <p className="text-slate-300 text-lg mb-8">Thanks for hosting!</p>

        <button
          onClick={handleCreateNewRoom}
          className="w-full py-4 px-4 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition text-lg mb-4"
        >
          Create New Room
        </button>

        <button
          onClick={handlePlayAgain}
          className="w-full py-3 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.98] focus-visible"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};