// ABOUTME: Player waiting screen while host prepares the game
// ABOUTME: Shows real-time player list and waits for host to start

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

export const Waiting = () => {
  const navigate = useNavigate();
  const { room, players, loading, subscribeToRoom } = useRoom();

  useEffect(() => {
    if (room?.code) {
      const unsubscribe = subscribeToRoom(room.code);
      return unsubscribe;
    } else {
      // No room in context, go back to join
      navigate('/play', { replace: true });
    }
  }, [room?.code, subscribeToRoom, navigate]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-2">The Rustam</h1>
        <p className="text-slate-300 mb-8">Waiting for host to start...</p>

        {/* Player Count */}
        <div className="mb-8 p-4 bg-slate-700 rounded-lg">
          <p className="text-white text-lg">
            {players.length} {players.length === 1 ? 'player' : 'players'} in game
          </p>
        </div>

        {/* Player List */}
        <div className="mb-8 p-4 bg-slate-700 rounded-lg text-left">
          <h3 className="text-white font-semibold mb-3">Players:</h3>
          <ul className="text-slate-300 text-sm space-y-2">
            {players.map((player) => (
              <li key={player.uid} className="flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                {player.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Leave Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-2 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};
