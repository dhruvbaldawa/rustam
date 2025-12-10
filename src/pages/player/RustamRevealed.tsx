// ABOUTME: Player screen showing who the Rustam was
// ABOUTME: Displays revealed Rustam identity and waiting for next round

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

export const RustamRevealed = () => {
  const navigate = useNavigate();
  const { room, players, subscribeToRoom } = useRoom();

  useEffect(() => {
    if (!room?.code) {
      navigate('/play', { replace: true });
      return;
    }

    const unsub = subscribeToRoom(room.code);

    // If status changes to lobby, go to waiting for next round
    if (room.status === 'lobby') {
      navigate('/play/waiting', { replace: true });
    }

    // If status is active, new round has started - go to role reveal
    if (room.status === 'active') {
      navigate('/play/role', { replace: true });
    }

    // If status is ended, go to game over
    if (room.status === 'ended') {
      navigate('/play/gameover', { replace: true });
    }

    return unsub;
  }, [room?.code, room?.status, subscribeToRoom, navigate]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  const rustamName = players.find((p) => p.uid === room.rustamUid)?.name || 'Unknown';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-2">The Rustam</h1>
        <p className="text-slate-300 mb-8">Round {room.currentRound} revealed</p>

        <div className="mb-8 p-6 bg-red-500/20 border border-red-500 rounded-lg">
          <p className="text-red-300 text-sm mb-2">The Rustam was:</p>
          <p className="text-white text-3xl font-bold">{rustamName}</p>
        </div>

        <p className="text-slate-300 mb-8">Waiting for next round...</p>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-3 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.98] focus-visible"
        >
          Leave Game
        </button>
      </div>
    </div>
  );
};
