# Error Handling Issues - Exact Locations and Patterns

## File: /Users/dhruv/Code/mole/src/contexts/RoomContext.tsx

### Issue 1.1: Room Listener - No Error Handler (Line 183)
```typescript
// CURRENT (BROKEN):
const unsubscribeRoom = onValue(roomRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val() as Omit<RoomData, 'code'>;
    setRoom({ code: roomCode, ...data });
  }
});

// SHOULD BE:
const unsubscribeRoom = onValue(
  roomRef,
  (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as Omit<RoomData, 'code'>;
      setRoom({ code: roomCode, ...data });
    }
  },
  (error) => {
    console.error('Room listener error:', error);
    setError(`Failed to sync room: ${error.message}`);
  }
);
```

### Issue 1.2: Players Listener - No Error Handler (Line 192)
```typescript
// CURRENT (BROKEN):
const unsubscribePlayers = onValue(playersRef, (snapshot) => {
  if (snapshot.exists()) {
    const playersData = snapshot.val() as Record<string, Omit<Player, 'uid'>>;
    const playersList: Player[] = Object.entries(playersData).map(([uid, data]) => ({
      uid,
      ...data,
    }));
    setPlayers(playersList);
  } else {
    setPlayers([]);
  }
});

// SHOULD BE:
const unsubscribePlayers = onValue(
  playersRef,
  (snapshot) => {
    // ... existing code ...
  },
  (error) => {
    console.error('Players listener error:', error);
    setError(`Failed to sync players: ${error.message}`);
  }
);
```

### Issue 1.3: revealRustam - Context Error Not Displayed (Line 325)
```typescript
// LOCATION: /Users/dhruv/Code/mole/src/pages/host/Game.tsx:39-52
// PROBLEM: revealRustam error is set in context but Game.tsx doesn't display it

// In RoomContext.tsx, this error is set but goes unused:
const revealRustam = useCallback(async (roomCode: string): Promise<boolean> => {
  // ...
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMessage); // ← Set in context
    return false;
  }
}, [room]); // ← Also BUG: [room] dependency causes unnecessary re-creation

// Game.tsx should display this:
// Add to Game component:
const { room, players, revealRustam, nextRound, endGame, subscribeToRoom, error } = useRoom();

// Add error display:
{error && (
  <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
    {error}
  </div>
)}
```

### Issue 1.4: nextRound - No User Feedback (Line 348)
```typescript
// LOCATION: /Users/dhruv/Code/mole/src/pages/host/Game.tsx:45-51
// PROBLEM: nextRound failure not shown to host

// In Game.tsx:
const handleNextRound = async () => {
  if (roomCode) {
    const success = await nextRound(roomCode);
    if (success) {
      navigate('/host', { replace: true });
    }
    // ← Missing: Show error if success === false
  }
};

// SHOULD BE:
const handleNextRound = async () => {
  if (roomCode) {
    const success = await nextRound(roomCode);
    if (success) {
      navigate('/host', { replace: true });
    } else {
      // Show error to user - error is in context
      alert(error || 'Failed to proceed to next round. Try again.');
    }
  }
};
```

### Issue 1.5: endGame - No User Feedback (Line 409)
```typescript
// LOCATION: /Users/dhruv/Code/mole/src/pages/host/Game.tsx:54-59
// Same as nextRound - success/failure not displayed

const handleEndGame = async () => {
  if (roomCode) {
    await endGame(roomCode); // ← No success check, no error display
    navigate('/', { replace: true });
  }
};
```

### Issue 1.6: generateRoomCode - No Timeout (Line 65)
```typescript
// CURRENT (RISKY):
const generateRoomCode = useCallback(async (): Promise<string> => {
  let code = '';
  let exists = true;

  while (exists) { // ← Could loop forever if Firebase is down
    code = String(Math.floor(1000 + Math.random() * 9000));
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef); // ← Can throw, no catch
    exists = snapshot.exists();
  }

  return code;
}, []);

// SHOULD BE:
const generateRoomCode = useCallback(async (): Promise<string> => {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const code = String(Math.floor(1000 + Math.random() * 9000));
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        return code;
      }
    } catch (err) {
      throw new Error(`Failed to generate room code: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  throw new Error('Failed to generate unique room code after 100 attempts');
}, []);
```

### Issue 1.7: restoreHostSession - Weak Validation (Line 214)
```typescript
// LOCATION: /Users/dhruv/Code/mole/src/contexts/RoomContext.tsx:214-228
// PROBLEM: Doesn't validate that room actually still exists

const restoreHostSession = useCallback(async (): Promise<string | null> => {
  const savedRoom = localStorage.getItem('rustam_host_room');
  if (savedRoom) {
    const roomRef = ref(db, `rooms/${savedRoom}`);
    const snapshot = await get(roomRef);
    if (snapshot.exists()) { // ← Good
      const roomData = snapshot.val() as Omit<RoomData, 'code'>;
      if (roomData.hostUid === auth.currentUser?.uid) { // ← Good
        setRoom({ code: savedRoom, ...roomData });
        return savedRoom; // ← But room could be in 'ended' state
      }
    }
    // Missing: Clean up localStorage if room doesn't exist in Firebase
  }
  return null;
}, []);

// SHOULD BE:
const restoreHostSession = useCallback(async (): Promise<string | null> => {
  const savedRoom = localStorage.getItem('rustam_host_room');
  if (savedRoom) {
    try {
      const roomRef = ref(db, `rooms/${savedRoom}`);
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        const roomData = snapshot.val() as Omit<RoomData, 'code'>;
        if (roomData.hostUid === auth.currentUser?.uid && roomData.status === 'lobby') {
          setRoom({ code: savedRoom, ...roomData });
          return savedRoom;
        }
      } else {
        // Room doesn't exist in Firebase, clean up localStorage
        localStorage.removeItem('rustam_host_room');
      }
    } catch (err) {
      console.error('Failed to restore host session:', err);
      setError(`Failed to restore session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }
  return null;
}, []);
```

---

## File: /Users/dhruv/Code/mole/src/pages/player/RoleReveal.tsx

### Issue 2.1: Role Listener - No Error Handler (Line 32)
```typescript
// CURRENT (BROKEN):
const unsubRole = onValue(roleRef, (snapshot) => {
  if (snapshot.exists()) {
    setRole(snapshot.val());
    setLoading(false);
  }
  // ← Missing: What if snapshot doesn't exist? Loading stays true forever
  // ← Missing: Error handler for network failures
});

// SHOULD BE:
const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);
const [roleError, setRoleError] = useState<string | null>(null);

const unsubRole = onValue(
  roleRef,
  (snapshot) => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    if (snapshot.exists()) {
      setRole(snapshot.val());
      setLoading(false);
    } else {
      // Role data missing - shouldn't happen but handle it
      setRoleError('Role data not found. Please try refreshing.');
      setLoading(false);
    }
  },
  (error) => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    console.error('Role listener error:', error);
    setRoleError(`Failed to load role: ${error.message}`);
    setLoading(false);
  }
);

// Add timeout to prevent indefinite loading:
useEffect(() => {
  if (room?.code && auth.currentUser && loading) {
    const timeout = setTimeout(() => {
      setRoleError('Role loading took too long. Please try refreshing.');
      setLoading(false);
    }, 5000); // 5 second timeout
    setLoadingTimeout(timeout);
  }

  return () => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
  };
}, [room?.code, auth.currentUser, loading]);

// Display error in UI:
if (loading || !role) {
  if (roleError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-800 p-4">
        <div className="text-center text-white">
          <p className="text-xl font-bold mb-4">Error</p>
          <p className="text-red-300 mb-4">{roleError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-800">
      <p className="text-white text-xl">Getting your role...</p>
    </div>
  );
}
```

---

## File: /Users/dhruv/Code/mole/src/hooks/useAuth.ts

### Issue 3.1: Auth State Listener - No Error Handler (Line 21)
```typescript
// CURRENT (BROKEN):
const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
  if (currentUser) {
    setUser(currentUser);
    setLoading(false);
  } else {
    try {
      await signInAnon();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }
});

// MISSING: Error handler for auth state listener itself
// onAuthStateChanged can fail, but no error callback

// SHOULD BE:
const unsubscribe = onAuthStateChanged(
  auth,
  async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else {
      try {
        await signInAnon();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setLoading(false);
      }
    }
  },
  (error) => {
    // Auth state change listener failed
    console.error('Auth state listener error:', error);
    setError(`Authentication error: ${error.message}`);
    setLoading(false);
  }
);
```

---

## File: /Users/dhruv/Code/mole/src/pages/host/Lobby.tsx

### Issue 4.1: Start Round No Error Display (Line 119)
```typescript
// CURRENT (BROKEN):
<button
  onClick={async () => {
    if (players.length >= 2) {
      const success = await startRound(room.code);
      if (success) {
        navigate('/host/game', { state: { roomCode: room.code } });
      }
      // ← No error shown if success === false
      // ← No error toast/message
    }
  }}
>

// SHOULD BE:
const { room, players, error, createRoom, subscribeToRoom, restoreHostSession, startRound } = useRoom();
const [startError, setStartError] = useState<string | null>(null);

<button
  onClick={async () => {
    setStartError(null);
    if (players.length >= 2) {
      const success = await startRound(room.code);
      if (success) {
        navigate('/host/game', { state: { roomCode: room.code } });
      } else {
        setStartError(error || 'Failed to start game. Please try again.');
      }
    }
  }}
>

// Add error display above button:
{startError && (
  <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
    {startError}
  </div>
)}
```

### Issue 4.2: useEffect Dependency Infinite Loop (Line 51)
```typescript
// CURRENT (RISKY):
useEffect(() => {
  const initRoom = async () => {
    // ...
  };

  initRoom();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [createRoom, restoreHostSession, subscribeToRoom, navigate, unsubscribe, rounds]);
//    ↑ Including unsubscribe causes effect to re-run when it changes

// SHOULD BE:
useEffect(() => {
  const initRoom = async () => {
    // ... existing code ...
  };

  initRoom();

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}, [createRoom, restoreHostSession, subscribeToRoom, navigate, rounds]);
// ↑ Remove 'unsubscribe' from dependencies - it will change frequently
```

---

## File: /Users/dhruv/Code/mole/src/pages/host/Game.tsx

### Issue 5.1: Missing Error Display (Line 15)
```typescript
// CURRENT (INCOMPLETE):
const { room, players, revealRustam, nextRound, endGame, subscribeToRoom } = useRoom();
// ↑ Not destructuring 'error'

// SHOULD BE:
const { room, players, revealRustam, nextRound, endGame, subscribeToRoom, error, loading } = useRoom();

// Add error display in component:
{error && (
  <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
    {error}
  </div>
)}

// Update handlers to check success:
const handleReveal = async () => {
  if (roomCode) {
    const success = await revealRustam(roomCode);
    if (!success) {
      // Error is now displayed via context.error UI above
      return;
    }
  }
};

const handleNextRound = async () => {
  if (roomCode) {
    const success = await nextRound(roomCode);
    if (success) {
      navigate('/host', { replace: true });
    } else {
      // Error displayed via context.error UI
      return;
    }
  }
};

const handleEndGame = async () => {
  if (roomCode) {
    const success = await endGame(roomCode);
    if (success) {
      navigate('/', { replace: true });
    } else {
      // Error displayed via context.error UI
      return;
    }
  }
};
```

---

## File: /Users/dhruv/Code/mole/src/pages/player/RustamRevealed.tsx

### Issue 6.1: Missing Name Fallback (Line 41)
```typescript
// CURRENT (RISKY):
const rustamName = players.find((p) => p.uid === room.rustamUid)?.name || 'Unknown';

// PROBLEM: Shows "Unknown" if:
// 1. Players list hasn't updated yet (race condition)
// 2. room.rustamUid is null/undefined
// 3. Player was deleted from Firebase

// SHOULD BE:
const [rustamError, setRustamError] = useState<string | null>(null);

useEffect(() => {
  if (room?.rustamUid && players.length > 0) {
    const rustam = players.find((p) => p.uid === room.rustamUid);
    if (!rustam) {
      // Rustam not in player list yet - might be race condition
      setRustamError('Rustam player data loading...');
    } else {
      setRustamError(null);
    }
  }
}, [room?.rustamUid, players]);

// Use in render:
<div className="mb-8 p-6 bg-red-500/20 border border-red-500 rounded-lg">
  <p className="text-red-300 text-sm mb-2">The Rustam was:</p>
  {rustamError ? (
    <p className="text-white text-3xl font-bold animate-pulse">{rustamError}</p>
  ) : (
    <p className="text-white text-3xl font-bold">{rustamName}</p>
  )}
</div>
```

---

## Summary of Required Changes by File

| File | Changes | Priority |
|---|---|---|
| RoomContext.tsx | Add error handlers to 2 onValue calls, generateRoomCode timeout, validation | CRITICAL + MEDIUM |
| useAuth.ts | Add error handler to onAuthStateChanged | CRITICAL |
| RoleReveal.tsx | Add error handler, timeout, error state | CRITICAL |
| Game.tsx | Display context.error, destructure it | HIGH |
| Lobby.tsx | Fix dependency array, show startRound error | HIGH |
| RustamRevealed.tsx | Handle missing player name race condition | HIGH |

Total changes: ~12 small patches, no major refactoring needed
