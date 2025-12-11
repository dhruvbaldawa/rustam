// ABOUTME: Player role reveal screen (green for theme, red for Rustam)
// ABOUTME: Full-screen display of player's role assignment

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '@/hooks/useRoom';
import { ref, onValue } from 'firebase/database';
import { db, auth } from '@/lib/firebase';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerRole {
  isRustam: boolean;
  theme: string | null;
  option: string | null;
}

export const RoleReveal = () => {
  const navigate = useNavigate();
  const { room, subscribeToRoom } = useRoom();
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to room updates
  useEffect(() => {
    if (!room?.code) {
      navigate('/play/waiting', { replace: true });
      return;
    }

    const unsub = subscribeToRoom(room.code);
    return unsub;
  }, [room?.code, subscribeToRoom, navigate]);

  // Listen to player's role - separate effect
  useEffect(() => {
    if (!room?.code || !auth.currentUser) {
      return;
    }

    const roleRef = ref(db, `rooms/${room.code}/roles/${auth.currentUser.uid}`);
    const unsubRole = onValue(
      roleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRole(snapshot.val());
          setLoading(false);
          setError(null);
        }
      },
      (err) => {
        setError(`Failed to load role: ${err.message}`);
        setLoading(false);
        console.error('Role listener error:', err);
      }
    );

    return unsubRole;
  }, [room?.code]);

  // Handle navigation based on room status - separate effect
  useEffect(() => {
    if (!room?.status) return;

    // If room status changes to revealed, navigate to reveal screen
    if (room.status === 'revealed') {
      navigate('/play/revealed', { replace: true });
      return;
    }

    // If status goes back to lobby (next round starting), stay and wait for new role
    if (room.status === 'lobby') {
      navigate('/play/waiting', { replace: true });
      return;
    }

    // If game ends, go to game over
    if (room.status === 'ended') {
      navigate('/play/gameover', { replace: true });
      return;
    }
  }, [room?.status, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic p-4 safe-area-top safe-area-bottom page-fade-in"
        style={{ backgroundColor: 'oklch(45% 0.2 25)' }}
      >
        <div className="text-center space-y-6">
          <p className="text-white text-2xl font-bold">Connection Error</p>
          <p className="text-white/80 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic bg-gradient-game safe-area-top safe-area-bottom page-fade-in">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Getting your role...</p>
        </div>
      </div>
    );
  }

  // Use subtle, similar colors so eavesdroppers can't distinguish Rustam from regular players
  // Both use dark purple/indigo tones - only the player knows their role
  const backgroundColor = role.isRustam
    ? 'oklch(35% 0.12 280)' // Deep purple (Rustam)
    : 'oklch(38% 0.10 260)'; // Slightly different indigo (safe player)

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen min-h-screen-dynamic p-4 transition-all duration-500 safe-area-top safe-area-bottom page-fade-in"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-md text-center role-reveal">
        {role.isRustam ? (
          <>
            {/* Rustam Role */}
            <div className="mb-6 fade-in-up">
              <span className="text-6xl md:text-7xl">🎭</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 fade-in-up">
              YOU ARE THE
            </h1>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 fade-in-up role-pulse">
              RUSTAM
            </h2>
            <div className="space-y-2 fade-in-up" style={{ animationDelay: '200ms' }}>
              <p className="text-white/90 text-lg md:text-xl">Figure out the theme.</p>
              <p className="text-white/90 text-lg md:text-xl">Blend in.</p>
            </div>
          </>
        ) : (
          <>
            {/* Safe Player Role */}
            <div className="mb-6 fade-in-up">
              <span className="text-6xl md:text-7xl">✨</span>
            </div>
            <p className="text-white/60 text-sm md:text-base mb-1 fade-in-up">Theme: {role.theme}</p>
            <p className="text-white/80 text-lg md:text-xl mb-2 fade-in-up">You are:</p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 fade-in-up role-pulse">
              {role.option || role.theme}
            </h1>
            <div className="bg-white/10 rounded-xl p-4 fade-in-up" style={{ animationDelay: '200ms' }}>
              <p className="text-white/80 text-sm md:text-base flex items-center justify-center gap-2">
                <span>🤫</span> Keep this secret!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
