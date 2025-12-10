import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { RustamRevealed } from './RustamRevealed';

// Mock Firebase
vi.mock('firebase/database', () => ({
    ref: vi.fn(),
    get: vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => ({ name: 'Alice' }),
    }),
}));

const mockSubscribeToRoom = vi.fn(() => vi.fn());
const mockRoom = {
    code: '1234',
    hostUid: 'host-123',
    status: 'revealed' as const,
    currentRound: 1,
    rustamUid: 'player-1',
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
        subscribeToRoom: mockSubscribeToRoom,
    }),
}));

vi.mock('@/lib/firebase', () => ({
    db: {},
    auth: {
        currentUser: { uid: 'player-2' },
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

describe('RustamRevealed Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRoom.status = 'revealed';
    });

    it('should display round number', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(screen.getByText(/Round 1 revealed/i)).toBeInTheDocument();
    });

    it('should display "The Rustam was" label', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(screen.getByText('The Rustam was')).toBeInTheDocument();
    });

    it('should display Rustam name from players array', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should display waiting for next round message', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(screen.getByText(/Waiting for next round/i)).toBeInTheDocument();
    });

    it('should have Leave Game button', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(screen.getByText(/Leave Game/i)).toBeInTheDocument();
    });

    it('should navigate to home when Leave Game clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        const leaveButton = screen.getByText(/Leave Game/i);
        await user.click(leaveButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should subscribe to room updates on mount', () => {
        render(
            <BrowserRouter>
                <RustamRevealed />
            </BrowserRouter>
        );

        expect(mockSubscribeToRoom).toHaveBeenCalledWith('1234');
    });
});
