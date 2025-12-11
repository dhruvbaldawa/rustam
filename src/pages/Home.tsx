// ABOUTME: Home page with Host Game and Join Game buttons
// ABOUTME: Entry point for choosing host or player role

import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';

export const Home = () => {
  const navigate = useNavigate();

  // Balloon positions and delays for staggered animation
  const balloons = [
    { emoji: '🎈', left: '5%', delay: '0s' },
    { emoji: '🎈', left: '15%', delay: '2s' },
    { emoji: '🎂', left: '85%', delay: '4s' },
    { emoji: '🎈', left: '92%', delay: '1s' },
    { emoji: '🎁', left: '8%', delay: '6s' },
    { emoji: '🎈', left: '88%', delay: '3s' },
  ];

  return (
    <PageLayout>
      {/* Floating balloons */}
      {balloons.map((balloon, i) => (
        <span
          key={i}
          className="balloon"
          style={{ left: balloon.left, animationDelay: balloon.delay }}
        >
          {balloon.emoji}
        </span>
      ))}

      <div className="w-full max-w-md text-center space-y-8 relative z-10">
        {/* Title Section */}
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl text-white/80 slide-up-title" style={{ animationDelay: '200ms' }}>
            कहाँ है
          </p>
          <h1 className="text-6xl md:text-7xl font-black text-white text-glow tracking-tight slide-up-title" style={{ animationDelay: '350ms' }}>
            Rustam
          </h1>
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
          🎂 Celebrating Darsh's 2nd Birthday! 🎈
        </p>
      </div>
    </PageLayout>
  );
};
