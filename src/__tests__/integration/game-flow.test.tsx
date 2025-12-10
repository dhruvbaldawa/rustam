import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoomContext } from '../../contexts/RoomContext';

// Import components for integration testing
import { Home } from '../../pages/Home';
import { Join } from '../../pages/player/Join';
import { Lobby } from '../../pages/host/Lobby';
import { Game } from '../../pages/host/Game';
import { HostGameOver } from '../../pages/host/GameOver';
import { GameOver as PlayerGameOver } from '../../pages/player/GameOver';

// ============================================================================
// Test Utilities - Mock Room Context Factory
// ============================================================================

interface MockRoomConfig {
  room?: {
    code: string;
    hostUid: string;
    status: 'lobby' | 'active' | 'revealed' | 'ended';
    currentRound: number;
    currentTheme?: string;
    rustamUid?: string;
    createdAt: number;
  } | null;
  players?: Array<{ uid: string; name: string; joinedAt: number }>;
  loading?: boolean;
  error?: string | null;
}

const createMockRoomContext = (config: MockRoomConfig = {}) => {
  const defaultRoom = {
    code: '1234',
    hostUid: 'host-123',
    status: 'lobby' as const,
    currentRound: 0,
    createdAt: Date.now(),
  };

  const defaultPlayers = [
    { uid: 'player-1', name: 'Alice', joinedAt: Date.now() },
    { uid: 'player-2', name: 'Bob', joinedAt: Date.now() },
  ];

  return {
    room: config.room ?? defaultRoom,
    players: config.players ?? defaultPlayers,
    loading: config.loading ?? false,
    error: config.error ?? null,
    createRoom: vi.fn().mockResolvedValue('1234'),
    joinRoom: vi.fn().mockResolvedValue(true),
    startRound: vi.fn().mockResolvedValue(true),
    revealRustam: vi.fn().mockResolvedValue(true),
    nextRound: vi.fn().mockResolvedValue(true),
    endGame: vi.fn().mockResolvedValue(true),
    leaveRoom: vi.fn(),
    subscribeToRoom: vi.fn(() => vi.fn()),
    restoreHostSession: vi.fn().mockResolvedValue(null),
    restorePlayerSession: vi.fn().mockResolvedValue(null),
  };
};

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'test-user-123' },
  },
}));

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ loading: false }),
}));

// ============================================================================
// Integration Tests - Navigation Flows
// ============================================================================

describe('Integration: Home Page Navigation', () => {
  it('should navigate to host lobby when Host Game clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/host" element={<div data-testid="host-lobby">Host Lobby</div>} />
        </Routes>
      </MemoryRouter>
    );

    const hostButton = screen.getByRole('button', { name: /Host Game/i });
    await user.click(hostButton);

    await waitFor(() => {
      expect(screen.getByTestId('host-lobby')).toBeInTheDocument();
    });
  });

  it('should navigate to player join when Join Game clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<div data-testid="player-join">Player Join</div>} />
        </Routes>
      </MemoryRouter>
    );

    const joinButton = screen.getByRole('button', { name: /Join Game/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(screen.getByTestId('player-join')).toBeInTheDocument();
    });
  });
});

describe('Integration: Host Game Over Flow', () => {
  it('should clear room and navigate home when Back to Home clicked', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext({
      room: {
        code: '1234',
        hostUid: 'host-123',
        status: 'ended',
        currentRound: 4,
        createdAt: Date.now(),
      },
    });

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/host/gameover']}>
          <Routes>
            <Route path="/host/gameover" element={<HostGameOver />} />
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    const homeButton = screen.getByText(/Back to Home/i);
    await user.click(homeButton);

    expect(mockContext.leaveRoom).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  it('should set skip_session_restore and navigate to /host when Create New Room clicked', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext({
      room: {
        code: '1234',
        hostUid: 'host-123',
        status: 'ended',
        currentRound: 4,
        createdAt: Date.now(),
      },
    });

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/host/gameover']}>
          <Routes>
            <Route path="/host/gameover" element={<HostGameOver />} />
            <Route path="/host" element={<div data-testid="new-lobby">New Lobby</div>} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    const createButton = screen.getByRole('button', { name: /Create New Room/i });
    await user.click(createButton);

    expect(mockContext.leaveRoom).toHaveBeenCalled();
    expect(sessionStorage.getItem('skip_session_restore')).toBe('true');
    await waitFor(() => {
      expect(screen.getByTestId('new-lobby')).toBeInTheDocument();
    });
  });
});

describe('Integration: Player Game Over Flow', () => {
  it('should clear room and navigate home when Play Again clicked', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext({
      room: {
        code: '1234',
        hostUid: 'host-123',
        status: 'ended',
        currentRound: 4,
        createdAt: Date.now(),
      },
    });

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/play/gameover']}>
          <Routes>
            <Route path="/play/gameover" element={<PlayerGameOver />} />
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    const playAgainButton = screen.getByRole('button', { name: /Play Again/i });
    await user.click(playAgainButton);

    expect(mockContext.leaveRoom).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Integration Tests - Game State Transitions
// ============================================================================

describe('Integration: Host Lobby to Game Transition', () => {
  it('should start round with selected theme when Start Game clicked', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext();

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/host']}>
          <Routes>
            <Route path="/host" element={<Lobby />} />
            <Route path="/host/game" element={<div data-testid="game-screen">Game Screen</div>} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    // Select Vehicles theme
    const vehiclesButton = screen.getByRole('button', { name: /Vehicles/i });
    await user.click(vehiclesButton);

    // Click Start Game
    const startButton = screen.getByRole('button', { name: /Start Game/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(mockContext.startRound).toHaveBeenCalledWith('1234', 'Vehicles');
    });
  });

  it('should use Random theme by default', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext();

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/host']}>
          <Routes>
            <Route path="/host" element={<Lobby />} />
            <Route path="/host/game" element={<div data-testid="game-screen">Game Screen</div>} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    // Click Start Game without changing theme
    const startButton = screen.getByRole('button', { name: /Start Game/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(mockContext.startRound).toHaveBeenCalledWith('1234', 'Random');
    });
  });
});

describe('Integration: Host Game Controls', () => {
  it('should reveal Rustam when Reveal button clicked', async () => {
    const user = userEvent.setup();
    const mockContext = createMockRoomContext({
      room: {
        code: '1234',
        hostUid: 'host-123',
        status: 'active',
        currentRound: 1,
        currentTheme: 'Kitchen Appliances',
        rustamUid: 'player-1',
        createdAt: Date.now(),
      },
    });

    render(
      <RoomContext.Provider value={mockContext}>
        <MemoryRouter initialEntries={['/host/game']} >
          <Routes>
            <Route path="/host/game" element={<Game />} />
          </Routes>
        </MemoryRouter>
      </RoomContext.Provider>
    );

    const revealButton = screen.getByRole('button', { name: /Reveal Rustam/i });
    await user.click(revealButton);

    await waitFor(() => {
      expect(mockContext.revealRustam).toHaveBeenCalledWith('1234');
    });
  });
});

// ============================================================================
// Placeholder Tests for Firebase Emulator
// NOTE: These require Firebase emulator setup for full e2e testing
// ============================================================================

describe.skip('Full Game Flow (Requires Firebase Emulator)', () => {
  it('should complete a full game: create room → join → start → reveal → end', async () => {
    // This would require Firebase emulator for proper e2e testing
    expect(true).toBe(true);
  });

  it('should persist session across page refresh', async () => {
    // This would require testing localStorage + Firebase state together
    expect(true).toBe(true);
  });
});
