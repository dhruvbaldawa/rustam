import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { GameOver } from './GameOver';

// Mock hooks
const mockLeaveRoom = vi.fn();

vi.mock('@/hooks/useRoom', () => ({
    useRoom: () => ({
        leaveRoom: mockLeaveRoom,
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

describe('Player GameOver Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should display Game Over title', () => {
        render(
            <BrowserRouter>
                <GameOver />
            </BrowserRouter>
        );

        expect(screen.getByText('Game Over')).toBeInTheDocument();
    });

    it('should display thanks for playing message', () => {
        render(
            <BrowserRouter>
                <GameOver />
            </BrowserRouter>
        );

        expect(screen.getByText('Thanks for playing!')).toBeInTheDocument();
    });

    it('should have Play Again button', () => {
        render(
            <BrowserRouter>
                <GameOver />
            </BrowserRouter>
        );

        expect(screen.getByRole('button', { name: /Play Again/i })).toBeInTheDocument();
    });

    it('should call leaveRoom and navigate to / when Play Again clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <GameOver />
            </BrowserRouter>
        );

        const playAgainButton = screen.getByRole('button', { name: /Play Again/i });
        await user.click(playAgainButton);

        expect(mockLeaveRoom).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
});
