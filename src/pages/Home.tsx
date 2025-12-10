// ABOUTME: Home page with Host Game and Join Game buttons
// ABOUTME: Entry point for choosing host or player role

import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="w-full max-w-md text-center space-y-8">
        {/* Title Section */}
        <div className="space-y-2 fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold text-white text-glow tracking-tight">
            The Rustam
          </h1>
          <p className="text-xl text-muted-foreground">Party Game</p>
        </div>

        {/* Action Cards */}
        <Card glass glow className="p-6 space-y-4 fade-in-up" style={{ animationDelay: '100ms' }}>
          <Button
            onClick={() => navigate('/host')}
            size="xl"
            className="w-full gap-3"
          >
            <Gamepad2 className="w-6 h-6" />
            Host Game
          </Button>

          <Button
            onClick={() => navigate('/play')}
            variant="success"
            size="xl"
            className="w-full gap-3"
          >
            <Users className="w-6 h-6" />
            Join Game
          </Button>
        </Card>

        {/* Footer */}
        <p className="text-sm text-muted-foreground fade-in-up" style={{ animationDelay: '200ms' }}>
          Find the imposter among your friends
        </p>
      </div>
    </PageLayout>
  );
};
