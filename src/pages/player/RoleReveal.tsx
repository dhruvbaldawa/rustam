// ABOUTME: Player role reveal screen (green for theme, red for Rustam)
// ABOUTME: Full-screen display of player's role assignment

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';
import { ref, onValue, get } from 'firebase/database';
import { db, auth } from '../../lib/firebase';

interface PlayerRole {
  isRustam: boolean;
  theme: string | null;
}

export const RoleReveal = () => {
  const navigate = useNavigate();
  const { room, subscribeToRoom } = useRoom();
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!room?.code || !auth.currentUser) {
      navigate('/play/waiting', { replace: true });
      return;
    }

    // Subscribe to room updates to detect when reveal happens
    const unsub = subscribeToRoom(room.code);

    // Listen to player's role
    const roleRef = ref(db, `rooms/${room.code}/roles/${auth.currentUser.uid}`);
    const unsubRole = onValue(roleRef, (snapshot) => {
      if (snapshot.exists()) {
        setRole(snapshot.val());
        setLoading(false);
      }
    });

    // If room status changes to revealed, navigate to reveal screen
    if (room.status === 'revealed' && role) {
      navigate('/play/revealed', { replace: true });
    }

    // If game ends, go to game over
    if (room.status === 'ended') {
      navigate('/play/gameover', { replace: true });
    }

    return () => {
      unsub();
      unsubRole();
    };
  }, [room?.code, room?.status, subscribeToRoom, navigate, role]);

  if (loading || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800">
        <p className="text-white text-xl">Getting your role...</p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 transition-all duration-500"
      style={{
        backgroundColor: role.isRustam ? '#ef4444' : '#22c55e',
      }}
    >
      <div className="w-full max-w-md text-center">
        {role.isRustam ? (
          <>
            <p className="text-white/80 text-xl mb-4">🔴</p>
            <h1 className="text-6xl font-bold text-white mb-4">YOU ARE THE</h1>
            <h2 className="text-7xl font-bold text-white mb-8">RUSTAM</h2>
            <p className="text-white text-xl mb-4">Figure out the theme.</p>
            <p className="text-white text-xl">Blend in.</p>
          </>
        ) : (
          <>
            <p className="text-white/80 text-xl mb-4">🟢</p>
            <p className="text-white text-lg mb-4">Theme:</p>
            <h1 className="text-5xl font-bold text-white mb-8">{role.theme}</h1>
            <p className="text-white text-sm">Keep this secret!</p>
          </>
        )}
      </div>
    </div>
  );
};
