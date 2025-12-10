import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Lobby } from './Lobby';

// Mock useRoom
vi.mock('../../hooks/useRoom', () => ({
  useRoom: () => ({
    room: {
      code: '1234',
      hostUid: 'host-123',
      status: 'lobby',
      currentRound: 0,
      createdAt: Date.now(),
    },
    players: [
      { uid: 'player-1', name: 'Alice', joinedAt: Date.now() },
      { uid: 'player-2', name: 'Bob', joinedAt: Date.now() },
    ],
    loading: false,
    createRoom: vi.fn().mockResolvedValue('1234'),
    startRound: vi.fn().mockResolvedValue(true),
    subscribeToRoom: vi.fn(),
    restoreHostSession: vi.fn().mockResolvedValue(null),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Host Lobby', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should display room code', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should show player count', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText(/2 players/i)).toBeInTheDocument();
  });

  it('should list all players', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should enable Start Game button with 2+ players', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const startButton = screen.getByRole('button', { name: /Start Game/i });
    expect(startButton).not.toBeDisabled();
  });

  it('should display QR code', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText(/Scan to join/i)).toBeInTheDocument();
  });

  it('should navigate to game when Start Game clicked with 2+ players', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const startButton = screen.getByRole('button', { name: /Start Game/i });
    await user.click(startButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
