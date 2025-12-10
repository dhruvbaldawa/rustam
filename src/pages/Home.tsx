// ABOUTME: Home page with Host Game and Join Game buttons
// ABOUTME: Entry point for choosing host or player role

import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 gap-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">The Rustam</h1>
        <p className="text-xl text-slate-300 mb-12">Party Game</p>
      </div>

      <div className="flex flex-col gap-6 w-full max-w-xs px-4">
        <button
          onClick={() => navigate('/host')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
        >
          Host Game
        </button>

        <button
          onClick={() => navigate('/play')}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};
