// ABOUTME: Player game over screen
// ABOUTME: Displays game end message and option to return home

import { useNavigate } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

export const GameOver = () => {
  const navigate = useNavigate();
  const { leaveRoom } = useRoom();

  const handlePlayAgain = () => {
    leaveRoom();
    navigate('/', { replace: true });
  };

  return (
    <PageLayout>
      <div className="w-full max-w-md text-center space-y-8">
        {/* Celebration Icon */}
        <div className="fade-in-up">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="fade-in-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-5xl font-bold text-white text-glow mb-2">Game Over</h1>
          <p className="text-muted-foreground text-lg">Thanks for playing!</p>
        </div>

        {/* Action Card */}
        <Card glass glow className="fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <Button
              onClick={handlePlayAgain}
              variant="success"
              size="xl"
              className="w-full gap-3"
            >
              <Home className="w-6 h-6" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};
