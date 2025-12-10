import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { HostGameOver } from './GameOver';

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

describe('HostGameOver Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    it('should display Game Over title', () => {
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        expect(screen.getByText('Game Over')).toBeInTheDocument();
    });

    it('should display thanks message', () => {
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        expect(screen.getByText('Thanks for hosting!')).toBeInTheDocument();
    });

    it('should have Create New Room button', () => {
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        expect(screen.getByRole('button', { name: /Create New Room/i })).toBeInTheDocument();
    });

    it('should have Back to Home button', () => {
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
    });

    it('should call leaveRoom and navigate to /host when Create New Room clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        const createButton = screen.getByRole('button', { name: /Create New Room/i });
        await user.click(createButton);

        expect(mockLeaveRoom).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/host', { replace: true });
        expect(sessionStorage.getItem('skip_session_restore')).toBe('true');
    });

    it('should call leaveRoom and navigate to / when Back to Home clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <HostGameOver />
            </BrowserRouter>
        );

        const homeButton = screen.getByText(/Back to Home/i);
        await user.click(homeButton);

        expect(mockLeaveRoom).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
});
