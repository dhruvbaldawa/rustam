// ABOUTME: Player game over screen
// ABOUTME: Displays game end message and option to return home

import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

export const GameOver = () => {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  const handlePlayAgain = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Game Over</h1>
        <p className="text-slate-300 text-lg mb-8">Thanks for playing!</p>

        <button
          onClick={handlePlayAgain}
          className="w-full py-4 px-4 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition text-lg"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
