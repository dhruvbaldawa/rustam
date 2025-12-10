// PWA utility tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isPWAInstalled,
  validateManifest,
  validateIcons,
  initPWAInstall,
  installPWA,
  isInstallAvailable,
  initPWAMonitoring
} from '../../lib/pwa';

// Mock window object
const mockMatchMedia = vi.fn();
const mockFetch = vi.fn();
const mockAddEventListener = vi.fn();
const mockConsoleError = vi.fn();

beforeEach(() => {
  vi.stubGlobal('matchMedia', mockMatchMedia);
  vi.stubGlobal('fetch', mockFetch);
  vi.stubGlobal('console', { ...console, error: mockConsoleError });
  vi.stubGlobal('addEventListener', mockAddEventListener);

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PWA Installation Detection', () => {
  it('detects standalone mode via display-mode media query', () => {
    mockMatchMedia.mockReturnValue({ matches: true });
    expect(isPWAInstalled()).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
  });

  it('detects installed via iOS standalone', () => {
    vi.stubGlobal('navigator', { standalone: true });
    mockMatchMedia.mockReturnValue({ matches: false });
    expect(isPWAInstalled()).toBe(true);
  });

  it('returns false when not installed', () => {
    vi.stubGlobal('navigator', { standalone: false });
    mockMatchMedia.mockReturnValue({ matches: false });
    expect(isPWAInstalled()).toBe(false);
  });
});

describe('Manifest Validation', () => {
  it('validates manifest successfully', async () => {
    const mockManifest = {
      name: 'The Rustam',
      icons: [{ src: '/icon.png', sizes: '192x192' }]
    };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockManifest)
    });

    const result = await validateManifest();
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('/manifest.json');
  });

  it('rejects invalid manifest structure', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ invalid: 'structure' })
    });

    const result = await validateManifest();
    expect(result).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith('Invalid manifest structure');
  });

  it('handles fetch failure', async () => {
    mockFetch.mockResolvedValue({ ok: false });

    const result = await validateManifest();
    expect(result).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith('Manifest fetch failed:', undefined);
  });
});

describe('Icon Validation', () => {
  it('validates all icons successfully', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    const result = await validateIcons();
    expect(result).toBe(true);

    // Should check all 4 icons
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('fails when icon fails to load', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    mockFetch.mockResolvedValueOnce({ ok: false });

    const result = await validateIcons();
    expect(result).toBe(false);
    expect(mockConsoleError).toHaveBeenCalledWith('Error validating icons:', expect.any(Error));
  });
});

describe('PWA Install Flow', () => {
  beforeEach(() => {
    // Reset the module state
    vi.resetModules();
  });

  it('initializes install prompt listener', () => {
    initPWAInstall();
    expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('appinstalled', expect.any(Function));
  });

  it('installs PWA successfully', async () => {
    const mockDeferredPrompt = {
      prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' }),
      preventDefault: vi.fn()
    };

    // Mock the event listener to capture the prompt
    let beforeInstallCallback: ((e: any) => void) | null = null;
    mockAddEventListener.mockImplementation((event: string, callback: Function) => {
      if (event === 'beforeinstallprompt') {
        beforeInstallCallback = callback as any;
      }
    });

    // Initialize PWA install listener
    initPWAInstall();

    // Simulate beforeinstallprompt event
    if (beforeInstallCallback) {
      beforeInstallCallback(mockDeferredPrompt);
    }

    const result = await installPWA();
    expect(result).toEqual({ outcome: 'accepted' });
    expect(mockDeferredPrompt.prompt).toHaveBeenCalled();
  });

  it('handles user dismissal', async () => {
    const mockDeferredPrompt = {
      prompt: vi.fn().mockResolvedValue({ outcome: 'dismissed' }),
      preventDefault: vi.fn()
    };

    // Mock the event listener to capture the prompt
    let beforeInstallCallback: ((e: any) => void) | null = null;
    mockAddEventListener.mockImplementation((event: string, callback: Function) => {
      if (event === 'beforeinstallprompt') {
        beforeInstallCallback = callback as any;
      }
    });

    initPWAInstall();

    // Simulate beforeinstallprompt event
    if (beforeInstallCallback) {
      beforeInstallCallback(mockDeferredPrompt);
    }

    const result = await installPWA();
    expect(result).toEqual({ outcome: 'dismissed' });
  });

  it('returns unavailable when no prompt', async () => {
    const result = await installPWA();
    expect(result).toEqual({
      outcome: 'unavailable',
      error: 'PWA installation not available'
    });
  });

  it('handles installation errors', async () => {
    const mockDeferredPrompt = {
      prompt: vi.fn().mockRejectedValue(new Error('Install failed')),
      preventDefault: vi.fn()
    };

    let beforeInstallCallback: ((e: any) => void) | null = null;
    mockAddEventListener.mockImplementation((event: string, callback: Function) => {
      if (event === 'beforeinstallprompt') {
        beforeInstallCallback = callback as any;
      }
    });

    initPWAInstall();

    // Simulate beforeinstallprompt event
    if (beforeInstallCallback) {
      beforeInstallCallback(mockDeferredPrompt);
    }

    const result = await installPWA();
    expect(result).toEqual({
      outcome: 'unavailable',
      error: 'Install failed'
    });
  });

  it('detects when install is available', () => {
    const mockDeferredPrompt = {
      prompt: vi.fn(),
      preventDefault: vi.fn()
    };

    let beforeInstallCallback: ((e: any) => void) | null = null;
    mockAddEventListener.mockImplementation((event: string, callback: Function) => {
      if (event === 'beforeinstallprompt') {
        beforeInstallCallback = callback as any;
      }
    });

    mockMatchMedia.mockReturnValue({ matches: false });

    initPWAInstall();

    // Simulate beforeinstallprompt event
    if (beforeInstallCallback) {
      beforeInstallCallback(mockDeferredPrompt);
    }

    expect(isInstallAvailable()).toBe(true);
  });

  it('returns false when already installed', () => {
    mockMatchMedia.mockReturnValue({ matches: true });

    expect(isInstallAvailable()).toBe(false);
  });
});

describe('PWA Monitoring', () => {
  it('validates manifest and icons on init', async () => {
    mockFetch.mockResolvedValue({ ok: true });

    await initPWAMonitoring();

    // Should validate manifest
    expect(mockFetch).toHaveBeenCalledWith('/manifest.json');

    // Should validate icons (4 calls)
    expect(mockFetch).toHaveBeenCalledWith('/icon-192.png', { method: 'HEAD' });
    expect(mockFetch).toHaveBeenCalledWith('/icon-512.png', { method: 'HEAD' });
    expect(mockFetch).toHaveBeenCalledWith('/icon-maskable.png', { method: 'HEAD' });
    expect(mockFetch).toHaveBeenCalledWith('/icon.svg', { method: 'HEAD' });
  });
});