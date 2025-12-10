import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Waiting } from './Waiting';

// Mock hooks
const mockSubscribeToRoom = vi.fn(() => vi.fn());
const mockRoom = {
    code: '1234',
    hostUid: 'host-123',
    status: 'lobby' as const,
    currentRound: 0,
    createdAt: Date.now(),
};
const mockPlayers = [
    { uid: 'player-1', name: 'Alice', joinedAt: Date.now() },
    { uid: 'player-2', name: 'Bob', joinedAt: Date.now() },
];

vi.mock('@/hooks/useRoom', () => ({
    useRoom: () => ({
        room: mockRoom,
        players: mockPlayers,
        loading: false,
        subscribeToRoom: mockSubscribeToRoom,
    }),
}));

vi.mock('@/lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: { uid: 'player-1' },
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Waiting Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRoom.status = 'lobby';
    });

    it('should display player count', () => {
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('players in game')).toBeInTheDocument();
    });

    it('should display player names', () => {
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should display waiting message', () => {
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        expect(screen.getByText(/Waiting for host to start/i)).toBeInTheDocument();
    });

    it('should subscribe to room updates on mount', () => {
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        expect(mockSubscribeToRoom).toHaveBeenCalledWith('1234');
    });

    it('should have Leave Game button', () => {
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        expect(screen.getByText(/Leave Game/i)).toBeInTheDocument();
    });

    it('should navigate to home when Leave Game clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Waiting />
            </BrowserRouter>
        );

        const leaveButton = screen.getByText(/Leave Game/i);
        await user.click(leaveButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
