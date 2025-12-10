// ABOUTME: Host game screen showing Rustam identity
// ABOUTME: Host can reveal Rustam and proceed to next round

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

interface LocationState {
  roomCode: string;
}

export const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room, players, revealRustam, nextRound, endGame, subscribeToRoom, error } = useRoom();
  const [rustamName, setRustamName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);

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

  // Navigate to game over when game ends
  useEffect(() => {
    if (room?.status === 'ended') {
      navigate('/host/gameover', { replace: true });
    }
  }, [room?.status, navigate]);

  const handleReveal = async () => {
    if (roomCode) {
      setOperationLoading(true);
      setOperationError(null);
      try {
        const success = await revealRustam(roomCode);
        if (!success) {
          setOperationError('Failed to reveal Rustam');
        }
      } catch (err) {
        setOperationError(err instanceof Error ? err.message : 'Failed to reveal Rustam');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleNextRound = async () => {
    if (roomCode) {
      setOperationLoading(true);
      setOperationError(null);
      try {
        const success = await nextRound(roomCode);
        if (success) {
          navigate('/host', { replace: true });
        } else {
          setOperationError('Failed to start next round');
        }
      } catch (err) {
        setOperationError(err instanceof Error ? err.message : 'Failed to start next round');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleEndGame = async () => {
    if (roomCode) {
      setOperationLoading(true);
      setOperationError(null);
      try {
        const success = await endGame(roomCode);
        if (success) {
          navigate('/', { replace: true });
        } else {
          setOperationError('Failed to end game');
        }
      } catch (err) {
        setOperationError(err instanceof Error ? err.message : 'Failed to end game');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  if (loading || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800">
        <p className="text-white text-xl">Loading game...</p>
      </div>
    );
  }

  const isRevealed = room.status === 'revealed';
  const displayError = error || operationError;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md text-center">
        {displayError && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300 text-sm font-semibold">{displayError}</p>
          </div>
        )}

        <p className="text-slate-400 mb-4">Round {room.currentRound}</p>
        <p className="text-slate-300 text-lg mb-8">Theme: {room.currentTheme || 'Loading...'}</p>

        {!isRevealed ? (
          <>
            <div className="mb-8 p-6 bg-slate-700 rounded-lg">
              <p className="text-slate-300 text-sm mb-2">The Rustam is:</p>
              <p className="text-white text-3xl font-bold">{rustamName || 'Selecting...'}</p>
            </div>

            <button
              onClick={handleReveal}
              disabled={operationLoading}
              className="w-full py-4 px-4 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 btn-hover transition-all active:scale-[0.98] focus-visible text-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {operationLoading ? 'Revealing...' : 'Reveal Rustam'}
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
              disabled={operationLoading}
              className="w-full py-4 px-4 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 btn-hover transition-all active:scale-[0.98] focus-visible text-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {operationLoading ? 'Starting next round...' : 'Next Round'}
            </button>

            <button
              onClick={handleEndGame}
              disabled={operationLoading}
              className="w-full py-3 px-4 rounded-lg font-bold text-white bg-slate-600 hover:bg-slate-500 transition-all active:scale-[0.98] focus-visible text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {operationLoading ? 'Ending game...' : 'End Game'}
            </button>
          </>
        )}

        <button
          onClick={() => navigate('/host', { replace: true })}
          className="w-full mt-4 py-3 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.98] focus-visible"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
};
