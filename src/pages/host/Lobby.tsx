// ABOUTME: Host lobby screen showing room code and waiting for players
// ABOUTME: Displays QR code for easy joining and player list

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useRoom } from '../../hooks/useRoom';
import { Unsubscribe, ref, get } from 'firebase/database';
import { db } from '../../lib/firebase';

export const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, loading, createRoom, subscribeToRoom, restoreHostSession, startRound } = useRoom();
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);
  const [rounds, setRounds] = useState(4);

  useEffect(() => {
    const initRoom = async () => {
      // Try to restore session
      const existingRoom = await restoreHostSession();
      if (existingRoom) {
        const unsub = subscribeToRoom(existingRoom);
        setUnsubscribe(() => unsub);
        // If room is not in lobby state, navigate away
        const roomRef = ref(db, `rooms/${existingRoom}`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          setRounds(roomData.totalRounds || 4);
          if (roomData.status !== 'lobby') {
            navigate('/host/game', { state: { roomCode: existingRoom }, replace: true });
          }
        }
      } else {
        // Create new room with default rounds
        const newRoomCode = await createRoom(rounds);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRoom, restoreHostSession, subscribeToRoom, navigate]);

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Creating room...</p>
      </div>
    );
  }

  const joinUrl = `${window.location.origin}/play?code=${room.code}`;

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
            {players.length} {players.length === 1 ? 'player' : 'players'}
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

        {/* Round Configuration */}
        <div className="mb-8 p-4 bg-slate-700 rounded-lg">
          <label className="text-white text-sm mb-2 block">Number of Rounds:</label>
          <select
            value={rounds}
            onChange={(e) => setRounds(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-slate-600 text-white rounded border border-slate-500 focus:border-green-500 focus:outline-none"
          >
            <option value={3}>3 Rounds</option>
            <option value={4}>4 Rounds</option>
            <option value={5}>5 Rounds</option>
          </select>
        </div>

        {/* Start Game Button */}
        <button
          onClick={async () => {
            if (players.length >= 2) {
              const success = await startRound(room.code);
              if (success) {
                navigate('/host/game', { state: { roomCode: room.code } });
              }
            }
          }}
          disabled={players.length < 2}
          className={`w-full py-3 px-4 rounded-lg font-bold text-white transition cursor-pointer ${
            players.length >= 2
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-slate-600 cursor-not-allowed'
          }`}
        >
          {players.length >= 2 ? 'Start Game' : 'Need 2+ Players'}
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
