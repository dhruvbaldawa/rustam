import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Join } from './Join';

// Mock hooks and dependencies
const mockJoinRoom = vi.fn().mockResolvedValue(true);
const mockRestorePlayerSession = vi.fn().mockResolvedValue(null);
const mockSubscribeToRoom = vi.fn();

vi.mock('@/hooks/useRoom', () => ({
    useRoom: () => ({
        room: null,
        players: [],
        loading: false,
        error: null,
        joinRoom: mockJoinRoom,
        restorePlayerSession: mockRestorePlayerSession,
        subscribeToRoom: mockSubscribeToRoom,
    }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams()],
    };
});

describe('Join Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRestorePlayerSession.mockResolvedValue(null);
    });

    it('should render room code and name input fields', async () => {
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
        });
    });

    it('should render Join Game button', async () => {
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Join Game/i })).toBeInTheDocument();
        });
    });

    it('should show error for invalid room code (non 4-digit)', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
        });

        const codeInput = screen.getByPlaceholderText('0000');
        const nameInput = screen.getByPlaceholderText('First name');
        const joinButton = screen.getByRole('button', { name: /Join Game/i });

        await user.type(codeInput, '12'); // Only 2 digits
        await user.type(nameInput, 'Alice');
        await user.click(joinButton);

        expect(screen.getByText(/Room code must be 4 digits/i)).toBeInTheDocument();
    });

    it('should show error for empty name', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
        });

        const codeInput = screen.getByPlaceholderText('0000');
        const joinButton = screen.getByRole('button', { name: /Join Game/i });

        await user.type(codeInput, '1234');
        await user.click(joinButton);

        expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();
    });

    it('should show error for name over 10 characters', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
        });

        const codeInput = screen.getByPlaceholderText('0000');
        const nameInput = screen.getByPlaceholderText('First name');
        const joinButton = screen.getByRole('button', { name: /Join Game/i });

        await user.type(codeInput, '1234');
        // maxLength attribute is 10 on the input, so we need to bypass it
        nameInput.removeAttribute('maxLength');
        await user.type(nameInput, 'VeryLongNameHere');
        await user.click(joinButton);

        expect(screen.getByText(/Name must be 10 characters or less/i)).toBeInTheDocument();
    });

    it('should call joinRoom with valid inputs and navigate on success', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
        });

        const codeInput = screen.getByPlaceholderText('0000');
        const nameInput = screen.getByPlaceholderText('First name');
        const joinButton = screen.getByRole('button', { name: /Join Game/i });

        await user.type(codeInput, '1234');
        await user.type(nameInput, 'Alice');
        await user.click(joinButton);

        await waitFor(() => {
            expect(mockJoinRoom).toHaveBeenCalledWith('1234', 'Alice');
            expect(mockNavigate).toHaveBeenCalledWith('/play/waiting', { replace: true });
        });
    });

    it('should check for existing session on mount', async () => {
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockRestorePlayerSession).toHaveBeenCalled();
        });
    });

    it('should navigate to waiting if session exists', async () => {
        mockRestorePlayerSession.mockResolvedValue('1234');

        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/play/waiting', { replace: true });
        });
    });

    it('should filter non-numeric characters from room code input', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByPlaceholderText('0000')).toBeInTheDocument();
        });

        const codeInput = screen.getByPlaceholderText('0000');
        await user.type(codeInput, 'ab12cd34');

        expect(codeInput).toHaveValue('1234');
    });

    it('should have Back to Home button that navigates to /', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <Join />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Back to Home/i)).toBeInTheDocument();
        });

        const backButton = screen.getByText(/Back to Home/i);
        await user.click(backButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
