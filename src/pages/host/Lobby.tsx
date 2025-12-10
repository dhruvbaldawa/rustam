// ABOUTME: Host lobby screen showing room code and waiting for players
// ABOUTME: Displays QR code for easy joining and player list

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useRoom } from '../../hooks/useRoom';
import { Unsubscribe } from 'firebase/database';

export const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, loading, createRoom, subscribeToRoom, restoreHostSession } = useRoom();
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  useEffect(() => {
    const initRoom = async () => {
      // Try to restore session
      const existingRoom = await restoreHostSession();
      if (existingRoom) {
        const unsub = subscribeToRoom(existingRoom);
        setUnsubscribe(() => unsub);
      } else {
        // Create new room
        const newRoomCode = await createRoom();
        if (newRoomCode) {
          const unsub = subscribeToRoom(newRoomCode);
          setUnsubscribe(() => unsub);
        }
      }
    };

    initRoom();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [createRoom, restoreHostSession, subscribeToRoom, unsubscribe]);

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Creating room...</p>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/play?code=${room.code}`;
  const canStartGame = players.length >= 2;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-800 p-4">
      <div className="w-full max-w-md text-center">
        {/* Room Code */}
        <h1 className="text-6xl font-bold text-white mb-2" style={{ fontSize: '64px' }}>
          {room.code}
        </h1>
        <p className="text-slate-400 mb-8">Room Code</p>

        {/* QR Code */}
        <div className="flex justify-center mb-6 bg-white p-4 rounded-lg">
          <QRCode
            value={joinUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-slate-300 text-sm mb-2">Scan to join</p>
        <p className="text-slate-400 text-xs mb-8">Or enter code: {room.code}</p>

        {/* Player Count */}
        <div className="mb-8 p-4 bg-slate-700 rounded-lg">
          <p className="text-white text-lg">
            {players.length} / 12 players
          </p>
        </div>

        {/* Player List */}
        {players.length > 0 && (
          <div className="mb-8 p-4 bg-slate-700 rounded-lg text-left">
            <h3 className="text-white font-semibold mb-3">Players:</h3>
            <ul className="text-slate-300 text-sm space-y-1">
              {players.map((player) => (
                <li key={player.uid}>{player.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Start Game Button */}
        <button
          onClick={() => navigate('/host/game', { state: { roomCode: room.code } })}
          disabled={!canStartGame}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${
            canStartGame
              ? 'bg-green-500 hover:bg-green-600 cursor-pointer'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
          }`}
        >
          {canStartGame ? 'Start Game' : `Waiting for players (${players.length}/2)`}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 py-2 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
