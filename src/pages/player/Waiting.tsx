// ABOUTME: Player waiting screen while host prepares the game
// ABOUTME: Shows real-time player list and waits for host to start

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';
import { PlayerList } from '@/components/game/player-list';

export const Waiting = () => {
  const navigate = useNavigate();
  const { room, players, loading, subscribeToRoom } = useRoom();

  // Subscribe to room updates
  useEffect(() => {
    if (!room?.code) {
      // No room in context, go back to join
      navigate('/play', { replace: true });
      return;
    }

    const unsubscribe = subscribeToRoom(room.code);
    return unsubscribe;
  }, [room?.code, subscribeToRoom, navigate]);

  // Handle navigation based on room status - separate effect
  useEffect(() => {
    if (!room?.status) return;

    // If game has started (status changed to active), navigate to role reveal
    if (room.status === 'active') {
      navigate('/play/role', { replace: true });
      return;
    }

    // If rustam has been revealed, go to revealed screen
    if (room.status === 'revealed') {
      navigate('/play/revealed', { replace: true });
      return;
    }

    // If game ended, go to game over
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
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center fade-in-up">
          <h1 className="text-4xl font-bold text-white text-glow mb-1">कहाँ है Rustam</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 animate-pulse" />
            <p>Waiting for host to start...</p>
          </div>
        </div>

        {/* Player Count */}
        <Card glass glow className="fade-in-up" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-white text-glow mb-1">
              {players.length}
            </p>
            <p className="text-muted-foreground">
              {players.length === 1 ? 'player' : 'players'} in game
            </p>
          </CardContent>
        </Card>

        {/* Player List Card */}
        <Card glass className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerList
              players={players}
              highlightUid={auth.currentUser?.uid}
            />
          </CardContent>
        </Card>

        {/* Leave Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="w-full text-muted-foreground fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Leave Game
        </Button>
      </div>
    </PageLayout>
  );
};
