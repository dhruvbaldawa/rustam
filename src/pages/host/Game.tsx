// ABOUTME: Host game screen showing Rustam identity
// ABOUTME: Host can reveal Rustam and proceed to next round

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import { ref, get } from 'firebase/database';
import { db } from '../../lib/firebase';

interface LocationState {
  roomCode: string;
}

export const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room, players, revealRustam, subscribeToRoom } = useRoom();
  const [rustamName, setRustamName] = useState<string>('');
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const roomCode = (location.state as LocationState)?.roomCode || room?.code;

  useEffect(() => {
    if (roomCode) {
      const unsub = subscribeToRoom(roomCode);
      setLoading(false);
      return unsub;
    }
  }, [roomCode, subscribeToRoom]);

  // Fetch Rustam name
  useEffect(() => {
    if (room?.rustamUid && players.length > 0) {
      const rustam = players.find((p) => p.uid === room.rustamUid);
      if (rustam) {
        setRustamName(rustam.name);
      }
    }
  }, [room?.rustamUid, players]);

  const handleReveal = async () => {
    if (roomCode) {
      await revealRustam(roomCode);
      setRevealed(true);
    }
  };

  const handleNextRound = () => {
    navigate('/host', { replace: true });
  };

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Loading game...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 p-4">
      <div className="w-full max-w-md text-center">
        <p className="text-slate-400 mb-4">Round {room.currentRound}</p>
        <p className="text-slate-300 text-lg mb-8">Theme: {room.currentTheme || 'Loading...'}</p>

        {!revealed ? (
          <>
            <div className="mb-8 p-6 bg-slate-700 rounded-lg">
              <p className="text-slate-300 text-sm mb-2">The Rustam is:</p>
              <p className="text-white text-3xl font-bold">{rustamName || 'Selecting...'}</p>
            </div>

            <button
              onClick={handleReveal}
              className="w-full py-4 px-4 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition text-lg mb-4"
            >
              Reveal Rustam
            </button>
          </>
        ) : (
          <>
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-300 text-sm mb-2">The Rustam was:</p>
              <p className="text-white text-3xl font-bold">{rustamName}</p>
            </div>

            <button
              onClick={handleNextRound}
              className="w-full py-4 px-4 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition text-lg"
            >
              {room.currentRound < room.totalRounds ? 'Next Round' : 'End Game'}
            </button>
          </>
        )}

        <button
          onClick={() => navigate('/host', { replace: true })}
          className="w-full mt-4 py-2 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
};
