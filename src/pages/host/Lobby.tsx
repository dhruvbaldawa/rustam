// ABOUTME: Host lobby screen showing room code and waiting for players
// ABOUTME: Displays QR code for easy joining and theme cards for selection

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ArrowLeft, Play, Shuffle, Check } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Unsubscribe, ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { THEMES, RANDOM_THEME } from '@/lib/themes';
import { gameData } from '@/lib/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';
import { PlayerList } from '@/components/game/player-list';

// Get difficulty color
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'hard':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const Lobby = () => {
  const navigate = useNavigate();
  const { room, players, loading, error, createRoom, subscribeToRoom, restoreHostSession, startRound } = useRoom();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const initedRef = useRef(false);
  const [selectedTheme, setSelectedTheme] = useState<string>(RANDOM_THEME);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;

    const initRoom = async () => {
      // Check if we should skip session restoration
      const skipRestore = sessionStorage.getItem('skip_session_restore');
      if (skipRestore) {
        sessionStorage.removeItem('skip_session_restore');
        // Create new room immediately
        const newRoomCode = await createRoom();
        if (newRoomCode) {
          unsubscribeRef.current = subscribeToRoom(newRoomCode);
        }
        return;
      }

      // Try to restore session
      const existingRoom = await restoreHostSession();
      if (existingRoom) {
        unsubscribeRef.current = subscribeToRoom(existingRoom);
        // If room is not in lobby state, navigate away
        const roomRef = ref(db, `rooms/${existingRoom}`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          if (roomData.status !== 'lobby') {
            navigate('/host/game', { state: { roomCode: existingRoom }, replace: true });
          }
        }
      } else {
        // Create new room
        const newRoomCode = await createRoom();
        if (newRoomCode) {
          unsubscribeRef.current = subscribeToRoom(newRoomCode);
        }
      }
    };

    initRoom();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !room) {
    return (
      <PageLayout>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Creating room...</p>
        </div>
      </PageLayout>
    );
  }

  const joinUrl = `${window.location.origin}/play?code=${room.code}`;

  return (
    <PageLayout>
      <div className="w-full max-w-md space-y-6">
        {/* QR Code Card */}
        <Card glass glow className="fade-in-up">
          <CardContent className="p-4">
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <QRCode
                value={joinUrl}
                size={180}
                level="H"
              />
            </div>
            <div className="text-center mt-4 space-y-1">
              <p className="room-code text-3xl font-bold text-foreground">{room.code}</p>
              <p className="text-muted-foreground text-sm">Scan QR or enter code to join</p>
            </div>
          </CardContent>
        </Card>

        {/* Player List Card */}
        <Card glass className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Players</span>
              <span className="text-muted-foreground text-sm font-normal">
                {players.length} joined
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerList players={players} />
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-destructive/20 border-destructive fade-in-up">
            <CardContent className="p-4">
              <p className="text-destructive-foreground text-sm font-medium">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Theme Selection Cards */}
        <Card glass className="fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Choose Theme</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {/* Random Theme Card */}
              <button
                onClick={() => setSelectedTheme(RANDOM_THEME)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTheme === RANDOM_THEME
                    ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
                    : 'border-border bg-card/50 hover:border-primary/50'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground text-sm">Random</span>
                  {selectedTheme === RANDOM_THEME && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recommended</p>
              </button>

              {/* Theme Cards */}
              {gameData.themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.name)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${selectedTheme === theme.name
                      ? 'border-primary bg-primary/20 ring-2 ring-primary/50'
                      : 'border-border bg-card/50 hover:border-primary/50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground text-sm truncate pr-1">
                      {theme.name}
                    </span>
                    {selectedTheme === theme.name && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 border ${getDifficultyColor(theme.difficulty)}`}>
                    {theme.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Start Game Button */}
        <Button
          onClick={async () => {
            if (players.length >= 2) {
              const success = await startRound(room.code, selectedTheme);
              if (success) {
                navigate('/host/game', { state: { roomCode: room.code } });
              }
            }
          }}
          disabled={players.length < 2}
          variant={players.length >= 2 ? 'game' : 'secondary'}
          size="xl"
          className="w-full gap-3 fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <Play className="w-6 h-6" />
          {players.length >= 2 ? 'Start Game' : 'Need 2+ Players'}
        </Button>

        {/* Back Button */}
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </PageLayout>
  );
};
