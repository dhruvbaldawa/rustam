// ABOUTME: Player screen showing who the Rustam was
// ABOUTME: Displays revealed Rustam identity and waiting for next round

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

export const RustamRevealed = () => {
  const navigate = useNavigate();
  const { room, players, subscribeToRoom } = useRoom();
  const [rustamName, setRustamName] = useState<string>('Loading...');

  // Subscribe to room updates
  useEffect(() => {
    if (!room?.code) {
      navigate('/play', { replace: true });
      return;
    }

    const unsub = subscribeToRoom(room.code);
    return unsub;
  }, [room?.code, subscribeToRoom, navigate]);

  // Fetch Rustam name - check both players array and Firebase directly
  useEffect(() => {
    if (!room?.code || !room?.rustamUid) return;

    // First try from players array
    const rustamPlayer = players.find((p) => p.uid === room.rustamUid);
    if (rustamPlayer) {
      setRustamName(rustamPlayer.name);
      return;
    }

    // If not in players array, fetch from Firebase directly
    const fetchRustamName = async () => {
      try {
        const playerRef = ref(db, `rooms/${room.code}/players/${room.rustamUid}`);
        const snapshot = await get(playerRef);
        if (snapshot.exists()) {
          setRustamName(snapshot.val().name || 'Unknown');
        } else {
          setRustamName('Unknown');
        }
      } catch (err) {
        console.error('Failed to fetch Rustam name:', err);
        setRustamName('Unknown');
      }
    };

    fetchRustamName();
  }, [room?.code, room?.rustamUid, players]);

  // Handle navigation based on room status
  useEffect(() => {
    if (!room?.status) return;

    // If status changes to lobby, go to waiting for next round
    if (room.status === 'lobby') {
      navigate('/play/waiting', { replace: true });
      return;
    }

    // If status is active, new round has started - go to role reveal
    if (room.status === 'active') {
      navigate('/play/role', { replace: true });
      return;
    }

    // If status is ended, go to game over
    if (room.status === 'ended') {
      navigate('/play/gameover', { replace: true });
      return;
    }
  }, [room?.status, navigate]);

  if (!room) {
    return (
      <PageLayout>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Header */}
        <div className="fade-in-up">
          <h1 className="text-4xl font-bold text-white text-glow mb-1">The Rustam</h1>
          <p className="text-muted-foreground">Round {room.currentRound} revealed</p>
        </div>

        {/* Rustam Reveal Card */}
        <Card className="bg-destructive/20 border-destructive/50 fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              <Target className="w-12 h-12 mx-auto text-destructive animate-pulse" />
            </div>
            <p className="text-destructive text-sm mb-2">The Rustam was</p>
            <p className="text-4xl font-bold text-white text-glow-red">{rustamName}</p>
          </CardContent>
        </Card>

        {/* Waiting Message */}
        <Card glass className="fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4 flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Waiting for next round...</p>
          </CardContent>
        </Card>

        {/* Leave Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Game
        </Button>
      </div>
    </PageLayout>
  );
};
