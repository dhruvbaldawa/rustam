// ABOUTME: Custom hook for managing Firebase authentication state
// ABOUTME: Handles user login and session persistence

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnon } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // No user, try to sign in anonymously
        try {
          await signInAnon();
          // Auth state change will trigger this listener again
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  return { user, loading, error };
};
