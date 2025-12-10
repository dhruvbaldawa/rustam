// PWA installation and error handling utilities

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export interface PWAInstallResult {
  outcome: 'accepted' | 'dismissed' | 'unavailable';
  error?: string;
}

// Detect if PWA is installed
export const isPWAInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Validate manifest exists and loads correctly
export const validateManifest = async (): Promise<boolean> => {
  try {
    const response = await fetch('/manifest.json');
    if (!response.ok) {
      console.error('Manifest fetch failed:', response.status);
      return false;
    }

    const manifest = await response.json();

    // Basic validation
    if (!manifest.name || !manifest.icons || !Array.isArray(manifest.icons)) {
      console.error('Invalid manifest structure');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating manifest:', error);
    return false;
  }
};

// Check if icons load correctly
export const validateIcons = async (): Promise<boolean> => {
  const iconUrls = ['/icon-192.png', '/icon-512.png', '/icon-maskable.png', '/icon.svg'];

  try {
    await Promise.all(iconUrls.map(async (url) => {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Icon failed to load: ${url}`);
      }
    }));

    return true;
  } catch (error) {
    console.error('Error validating icons:', error);
    return false;
  }
};

// Listen for beforeinstallprompt event
export const initPWAInstall = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('PWA install prompt available');
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
  });
};

// Attempt to install PWA
export const installPWA = async (): Promise<PWAInstallResult> => {
  try {
    if (!deferredPrompt) {
      return { outcome: 'unavailable', error: 'PWA installation not available' };
    }

    const { outcome } = await deferredPrompt.prompt();
    deferredPrompt = null;

    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      return { outcome: 'accepted' };
    } else {
      console.log('User dismissed PWA installation');
      return { outcome: 'dismissed' };
    }
  } catch (error) {
    console.error('PWA installation failed:', error);
    return { outcome: 'unavailable', error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if installation is available
export const isInstallAvailable = (): boolean => {
  return deferredPrompt !== null && !isPWAInstalled();
};

// Initialize PWA error monitoring
export const initPWAMonitoring = (): void => {
  // Monitor manifest loading
  validateManifest().then(valid => {
    if (!valid) {
      console.error('PWA manifest validation failed');
    }
  });

  // Monitor icon loading
  validateIcons().then(valid => {
    if (!valid) {
      console.error('PWA icon validation failed');
    }
  });

  // Log PWA status
  console.log('PWA Status:', {
    isInstalled: isPWAInstalled(),
    supportsInstall: 'BeforeInstallPromptEvent' in window,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches
  });
};