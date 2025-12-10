// ABOUTME: Host game screen with question viewer
// ABOUTME: Host can reveal Rustam and proceed to next round, sees questions not Rustam identity

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Eye, SkipForward, XCircle, AlertCircle, Mic, Hand, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageLayout } from '@/components/game/page-layout';
import { getQuestionsForCategory, getPhysicalFormatInfo, Question, PhysicalQuestion } from '@/lib/gameData';

interface LocationState {
  roomCode: string;
}

export const Game = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { room, players, revealRustam, nextRound, endGame, subscribeToRoom, error } = useRoom();
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const roomCode = (location.state as LocationState)?.roomCode || room?.code;

  // Get questions for the current theme
  const questions = room?.currentTheme ? getQuestionsForCategory(room.currentTheme) : [];

  useEffect(() => {
    if (roomCode) {
      const unsub = subscribeToRoom(roomCode);
      setLoading(false);
      return unsub;
    }
  }, [roomCode, subscribeToRoom]);

  // Reset question index when theme changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [room?.currentTheme]);

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

  const handlePrevQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  // Get format display info for physical questions
  const getFormatBadge = (question: Question) => {
    if (question.type === 'physical') {
      const formatInfo = getPhysicalFormatInfo((question as PhysicalQuestion).format);
      return formatInfo?.name || (question as PhysicalQuestion).format;
    }
    return null;
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
  const currentQuestion = questions[currentQuestionIndex];

  // Find Rustam name for the revealed state
  const rustamName = players.find((p) => p.uid === room.rustamUid)?.name || 'Unknown';

  return (
    <PageLayout>
      <div className="w-full max-w-md space-y-6">
        {/* Round & Theme Info */}
        <div className="text-center fade-in-up">
          <p className="text-muted-foreground text-sm mb-1">Round {room.currentRound}</p>
          <p className="text-xl font-semibold text-foreground">
            Theme: <span className="text-accent">{room.currentTheme || 'Loading...'}</span>
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            {players.length} players
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
            {/* Question Viewer Card */}
            {currentQuestion && (
              <Card glass glow className="fade-in-up" style={{ animationDelay: '50ms' }}>
                <CardContent className="p-6">
                  {/* Question Type Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {currentQuestion.type === 'hotSeat' ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          <Mic className="w-3 h-3" />
                          Hotseat
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          <Hand className="w-3 h-3" />
                          Physical
                        </span>
                      )}
                      {currentQuestion.type === 'physical' && (
                        <span className="text-xs text-muted-foreground">
                          {getFormatBadge(currentQuestion)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>

                  {/* Question Text - Hindi (primary) + English (secondary) */}
                  <div className="text-center min-h-[100px] flex flex-col items-center justify-center gap-2">
                    <p className="text-xl font-medium text-white">
                      {currentQuestion.questionHindi}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-6">
                    <Button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === questions.length - 1}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
