// ABOUTME: Host lobby screen showing room code and waiting for players
// ABOUTME: Displays QR code for easy joining and player list

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Unsubscribe, ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { THEMES, RANDOM_THEME } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';
import { RoomCode } from '@/components/game/room-code';
import { PlayerList } from '@/components/game/player-list';

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

        {/* Theme Selection */}
        <Card glass className="fade-in-up" style={{ animationDelay: '150ms' }}>
          <CardContent className="p-4">
            <label htmlFor="theme-selector" className="block text-foreground font-semibold mb-2 text-sm">
              Choose Theme
            </label>
            <div className="relative">
              <Shuffle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                id="theme-selector"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full py-3 pl-10 pr-4 rounded-lg bg-input border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer appearance-none"
              >
                <option value={RANDOM_THEME}>{RANDOM_THEME} (Recommended)</option>
                {THEMES.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
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
