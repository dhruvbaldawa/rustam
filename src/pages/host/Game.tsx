// ABOUTME: Host game screen showing Rustam identity
// ABOUTME: Host can reveal Rustam and proceed to next round

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, SkipForward, XCircle, AlertCircle } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

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
      <PageLayout>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Loading game...</p>
        </div>
      </PageLayout>
    );
  }

  const isRevealed = room.status === 'revealed';
  const displayError = error || operationError;

  return (
    <PageLayout>
      <div className="w-full max-w-md space-y-6">
        {/* Round & Theme Info */}
        <div className="text-center fade-in-up">
          <p className="text-muted-foreground text-sm mb-1">Round {room.currentRound}</p>
          <p className="text-xl font-semibold text-foreground">
            Theme: <span className="text-accent">{room.currentTheme || 'Loading...'}</span>
          </p>
        </div>

        {/* Error Display */}
        {displayError && (
          <Card className="bg-destructive/20 border-destructive fade-in-up">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-destructive-foreground text-sm font-medium">{displayError}</p>
            </CardContent>
          </Card>
        )}

        {!isRevealed ? (
          <>
            {/* Rustam Identity Card - Pre-Reveal */}
            <Card glass glow className="fade-in-up" style={{ animationDelay: '50ms' }}>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-sm mb-2">The Rustam is</p>
                <p className="text-4xl font-bold text-white text-glow">
                  {rustamName || 'Selecting...'}
                </p>
                <p className="text-xs text-muted-foreground mt-4">Only you can see this</p>
              </CardContent>
            </Card>

            {/* Reveal Button */}
            <Button
              onClick={handleReveal}
              disabled={operationLoading}
              variant="destructive"
              size="xl"
              className="w-full gap-3 fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <Eye className="w-6 h-6" />
              {operationLoading ? 'Revealing...' : 'Reveal Rustam'}
            </Button>
          </>
        ) : (
          <>
            {/* Rustam Identity Card - Post-Reveal */}
            <Card className="bg-destructive/20 border-destructive fade-in-up">
              <CardContent className="p-8 text-center">
                <p className="text-destructive text-sm mb-2">The Rustam was</p>
                <p className="text-4xl font-bold text-white text-glow-red">
                  {rustamName}
                </p>
                <p className="text-xs text-muted-foreground mt-4">Everyone can see this now</p>
              </CardContent>
            </Card>

            {/* Next Round Button */}
            <Button
              onClick={handleNextRound}
              disabled={operationLoading}
              variant="success"
              size="xl"
              className="w-full gap-3 fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <SkipForward className="w-6 h-6" />
              {operationLoading ? 'Starting...' : 'Next Round'}
            </Button>

            {/* End Game Button */}
            <Button
              onClick={handleEndGame}
              disabled={operationLoading}
              variant="secondary"
              size="lg"
              className="w-full gap-3 fade-in-up"
              style={{ animationDelay: '150ms' }}
            >
              <XCircle className="w-5 h-5" />
              {operationLoading ? 'Ending...' : 'End Game'}
            </Button>
          </>
        )}

        {/* Back to Lobby */}
        <Button
          onClick={() => navigate('/host', { replace: true })}
          variant="ghost"
          className="w-full text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lobby
        </Button>
      </div>
    </PageLayout>
  );
};
