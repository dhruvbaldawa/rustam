// ABOUTME: Player join screen for entering room code and name
// ABOUTME: Handles joining room, name input, and reconnection logic

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageLayout } from '@/components/game/page-layout';

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
      <PageLayout>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white text-xl">Checking session...</p>
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
          <p className="text-muted-foreground">Join Game</p>
        </div>

        {/* Join Form Card */}
        <Card glass className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <form onSubmit={handleJoin} className="space-y-6">
              {/* Room Code Input */}
              <div>
                <label className="block text-foreground text-sm font-semibold mb-2">
                  Room Code
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="text-center text-3xl tracking-[0.3em] font-mono h-16"
                  error={!!joinError && joinError.includes('code')}
                />
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-foreground text-sm font-semibold mb-2">
                  Your Name
                </label>
                <Input
                  type="text"
                  maxLength={10}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  error={!!joinError && joinError.includes('name')}
                />
                <p className="text-muted-foreground text-xs mt-1">Max 10 characters</p>
              </div>

              {/* Error Message */}
              {joinError && (
                <div className="bg-destructive/20 border border-destructive rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <p className="text-destructive text-sm">{joinError}</p>
                </div>
              )}

              {/* Join Button */}
              <Button
                type="submit"
                disabled={joining}
                variant="success"
                size="xl"
                className="w-full gap-3"
              >
                <LogIn className="w-5 h-5" />
                {joining ? 'Joining...' : 'Join Game'}
              </Button>
            </form>
          </CardContent>
        </Card>

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
