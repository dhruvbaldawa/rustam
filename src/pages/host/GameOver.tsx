// ABOUTME: Host game over screen
// ABOUTME: Displays game end message and options to return home or create new room

import { useNavigate } from 'react-router-dom';
import { Home, PlusCircle, PartyPopper } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

export const HostGameOver = () => {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  const handlePlayAgain = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  const handleCreateNewRoom = () => {
    leaveRoom();
    // Add a flag to prevent session restoration
    sessionStorage.setItem('skip_session_restore', 'true');
    navigate('/host', { replace: true });
  };

  return (
    <PageLayout>
      <div className="w-full max-w-md text-center space-y-8">
        {/* Celebration Icon */}
        <div className="fade-in-up">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-float">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-5xl font-bold text-white text-glow mb-2">Game Over</h1>
          <p className="text-muted-foreground text-lg">Thanks for hosting!</p>
        </div>

        {/* Action Card */}
        <Card glass glow className="fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6 space-y-4">
            <Button
              onClick={handleCreateNewRoom}
              variant="success"
              size="xl"
              className="w-full gap-3"
            >
              <PlusCircle className="w-6 h-6" />
              Create New Room
            </Button>

            <Button
              onClick={handlePlayAgain}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
