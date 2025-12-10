import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Home } from './Home';

// Mock useAuth and useNavigate
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ loading: false }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render home page with game title', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText(/The Rustam/i)).toBeInTheDocument();
  });

  it('should have Host Game button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const hostButton = screen.getByRole('button', { name: /Host Game/i });
    expect(hostButton).toBeInTheDocument();
  });

  it('should have Join Game button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const joinButton = screen.getByRole('button', { name: /Join Game/i });
    expect(joinButton).toBeInTheDocument();
  });

  it('should navigate to host lobby when Host Game clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const hostButton = screen.getByRole('button', { name: /Host Game/i });
    await user.click(hostButton);

    expect(mockNavigate).toHaveBeenCalledWith('/host');
  });

  it('should navigate to join when Join Game clicked', async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const joinButton = screen.getByRole('button', { name: /Join Game/i });
    await user.click(joinButton);

    expect(mockNavigate).toHaveBeenCalledWith('/play');
  });
});
