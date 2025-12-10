// ABOUTME: Player join screen for entering room code and name
// ABOUTME: Handles joining room, name input, and reconnection logic

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const Join = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { room, players, loading, error, joinRoom, restorePlayerSession, subscribeToRoom } = useRoom();

  const [code, setCode] = useState(searchParams.get('code') || '');
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const existingRoom = await restorePlayerSession();
      if (existingRoom) {
        // Subscribe to updates and navigate to waiting screen
        subscribeToRoom(existingRoom);
        navigate('/play/waiting', { replace: true });
      } else {
        setIsRestoring(false);
      }
    };

    checkSession();
  }, [restorePlayerSession, subscribeToRoom, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);

    // Validation
    if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) {
      setJoinError('Room code must be 4 digits');
      return;
    }

    if (!name.trim()) {
      setJoinError('Please enter your name');
      return;
    }

    if (name.length > 10) {
      setJoinError('Name must be 10 characters or less');
      return;
    }

    setJoining(true);
    const success = await joinRoom(code, name.trim());

    if (success) {
      // Subscribe to room updates
      subscribeToRoom(code);
      // Navigate to waiting screen
      navigate('/play/waiting', { replace: true });
    } else {
      setJoinError(error || 'Failed to join room');
      setJoining(false);
    }
  };

  if (isRestoring) {
    return (
      <div className="flex items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 safe-area-top safe-area-bottom">
        <LoadingSpinner text="Checking session..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic bg-slate-800 p-4 safe-area-top safe-area-bottom">
      <div className="w-full max-w-md pb-4">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">The Rustam</h1>
        <p className="text-slate-300 text-center mb-8">Join Game</p>

        <form onSubmit={handleJoin} className="space-y-4">
          {/* Room Code Input */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Room Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="0000"
              className="w-full px-4 py-3 bg-slate-700 text-white text-center text-2xl tracking-widest rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              maxLength={10}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-slate-500 text-xs mt-1">Max 10 characters</p>
          </div>

          {/* Error Message */}
          {joinError && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
              {joinError}
            </div>
          )}

          {/* Join Button */}
          <button
            type="submit"
            disabled={joining}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all active:scale-[0.98] focus-visible ${
              joining
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-green-500 hover:bg-green-600 cursor-pointer btn-hover'
            }`}
          >
            {joining ? 'Joining...' : 'Join Game'}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg font-semibold text-slate-300 hover:text-white transition-all active:scale-[0.98] focus-visible"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
};
