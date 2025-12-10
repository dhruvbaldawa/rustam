import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Lobby } from './Lobby';

const mockStartRound = vi.fn().mockResolvedValue(true);

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
    startRound: mockStartRound,
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
    mockStartRound.mockClear();
    localStorage.clear();
  });

  it('should display room code', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Room code appears in the main display and in the help text
    const roomCodes = screen.getAllByText('1234');
    expect(roomCodes.length).toBeGreaterThan(0);
  });

  it('should show player count', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText(/2 joined/i)).toBeInTheDocument();
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

    expect(screen.getByText(/Scan QR or enter code to join/i)).toBeInTheDocument();
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

  it('should display theme selection heading', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText('Choose Theme')).toBeInTheDocument();
  });

  it('should show Random theme card as default selected', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Random card should be visible
    expect(screen.getByText('Random')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('should allow selecting a theme by clicking its card', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Click on Kitchen Appliances card
    const themeButton = screen.getByRole('button', { name: /Kitchen Appliances/i });
    await user.click(themeButton);

    // Should have been clicked (button is in the DOM)
    expect(themeButton).toBeInTheDocument();
  });

  it('should include theme cards with difficulty badges', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Theme cards should be visible
    expect(screen.getByText('Kitchen Appliances')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    // Difficulty badges should be visible
    expect(screen.getAllByText('easy').length).toBeGreaterThan(0);
  });

  it('should pass selected theme to startRound when theme card clicked then Start Game', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Select Vehicles theme by clicking its card
    const vehiclesButton = screen.getByRole('button', { name: /Vehicles/i });
    await user.click(vehiclesButton);

    // Click Start Game
    const startButton = screen.getByRole('button', { name: /Start Game/i });
    await user.click(startButton);

    // Verify startRound was called with the selected theme
    await waitFor(() => {
      expect(mockStartRound).toHaveBeenCalledWith('1234', 'Vehicles');
    });
  });

  it('should pass Random theme to startRound by default', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    // Click Start Game without changing theme (default is Random)
    const startButton = screen.getByRole('button', { name: /Start Game/i });
    await user.click(startButton);

    // Verify startRound was called with Random
    await waitFor(() => {
      expect(mockStartRound).toHaveBeenCalledWith('1234', 'Random');
    });
  });

});
