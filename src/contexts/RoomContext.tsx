// ABOUTME: Context for managing room state and operations
// ABOUTME: Handles room creation, player management, and game state with full TypeScript types

import { createContext, useState, useCallback, ReactNode } from 'react';
import { ref, set, get, onValue, Unsubscribe } from 'firebase/database';
import { db, auth } from '../lib/firebase';

export interface Player {
  uid: string;
  name: string;
  joinedAt: number;
}

export interface RoomData {
  code: string;
  hostUid: string;
  status: 'lobby' | 'active' | 'revealed' | 'ended';
  currentRound: number;
  totalRounds: number;
  createdAt: number;
}

export interface RoomContextType {
  room: RoomData | null;
  players: Player[];
  loading: boolean;
  error: string | null;
  createRoom: (totalRounds?: number) => Promise<string | null>;
  joinRoom: (roomCode: string, playerName: string) => Promise<boolean>;
  subscribeToRoom: (roomCode: string) => Unsubscribe;
  restoreHostSession: () => Promise<string | null>;
  restorePlayerSession: () => Promise<string | null>;
  startRound: (roomCode: string, totalRounds?: number) => Promise<boolean>;
  revealRustam: (roomCode: string) => Promise<boolean>;
  leaveRoom: () => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider = ({ children }: RoomProviderProps) => {
  const [room, setRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique 4-digit room code
  const generateRoomCode = useCallback(async (): Promise<string> => {
    let code: string;
    let exists = true;

    while (exists) {
      code = String(Math.floor(1000 + Math.random() * 9000));
      const roomRef = ref(db, `rooms/${code}`);
      const snapshot = await get(roomRef);
      exists = snapshot.exists();
    }

    return code;
  }, []);

  // Create a new room
  const createRoom = useCallback(
    async (totalRounds: number = 4): Promise<string | null> => {
      if (!auth.currentUser) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const roomCode = await generateRoomCode();
        const hostUid = auth.currentUser.uid;
        const now = Date.now();

        // Create room in database
        const roomData = {
          hostUid,
          status: 'lobby' as const,
          currentRound: 0,
          totalRounds,
          createdAt: now,
        };

        const roomRef = ref(db, `rooms/${roomCode}`);
        await set(roomRef, roomData);

        // Store in localStorage for reconnection
        localStorage.setItem('rustam_host_room', roomCode);

        const newRoom: RoomData = { code: roomCode, ...roomData };
        setRoom(newRoom);

        return roomCode;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [generateRoomCode]
  );

  // Join an existing room as a player
  const joinRoom = useCallback(
    async (roomCode: string, playerName: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const playerUid = auth.currentUser?.uid;
        if (!playerUid) {
          setError('Not authenticated');
          return false;
        }

        const roomRef = ref(db, `rooms/${roomCode}`);
        const snapshot = await get(roomRef);

        if (!snapshot.exists()) {
          setError('Room not found');
          return false;
        }

        const roomData = snapshot.val() as Omit<RoomData, 'code'>;
        if (roomData.status !== 'lobby') {
          setError('Room is not in active state');
          return false;
        }

        // Add player to room
        const playerRef = ref(db, `rooms/${roomCode}/players/${playerUid}`);
        await set(playerRef, {
          name: playerName,
          joinedAt: Date.now(),
        });

        // Store in localStorage for reconnection
        localStorage.setItem('rustam_player_room', roomCode);
        localStorage.setItem('rustam_player_uid', playerUid);

        setRoom({ code: roomCode, ...roomData });

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Listen to room updates
  const subscribeToRoom = useCallback(
    (roomCode: string): Unsubscribe => {
      if (!roomCode) return () => {};

      const roomRef = ref(db, `rooms/${roomCode}`);
      const unsubscribeRoom = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as Omit<RoomData, 'code'>;
          setRoom({ code: roomCode, ...data });
        }
      });

      // Listen to players
      const playersRef = ref(db, `rooms/${roomCode}/players`);
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

      return () => {
        unsubscribeRoom();
        unsubscribePlayers();
      };
    },
    []
  );

  // Restore host session on load
  const restoreHostSession = useCallback(async (): Promise<string | null> => {
    const savedRoom = localStorage.getItem('rustam_host_room');
    if (savedRoom) {
      const roomRef = ref(db, `rooms/${savedRoom}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const roomData = snapshot.val() as Omit<RoomData, 'code'>;
        if (roomData.hostUid === auth.currentUser?.uid) {
          setRoom({ code: savedRoom, ...roomData });
          return savedRoom;
        }
      }
    }
    return null;
  }, []);

  // Restore player session on load
  const restorePlayerSession = useCallback(async (): Promise<string | null> => {
    const savedRoom = localStorage.getItem('rustam_player_room');
    const playerUid = localStorage.getItem('rustam_player_uid');

    if (savedRoom && playerUid === auth.currentUser?.uid) {
      const playerRef = ref(db, `rooms/${savedRoom}/players/${playerUid}`);
      const snapshot = await get(playerRef);
      if (snapshot.exists()) {
        return savedRoom;
      }
    }
    return null;
  }, []);

  // Start a game round with role assignment
  const startRound = useCallback(
    async (roomCode: string, totalRounds: number = 4): Promise<boolean> => {
      if (!auth.currentUser) {
        setError('Not authenticated');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Get current room
        const roomRef = ref(db, `rooms/${roomCode}`);
        const roomSnapshot = await get(roomRef);

        if (!roomSnapshot.exists()) {
          setError('Room not found');
          return false;
        }

        const roomData = roomSnapshot.val() as Omit<RoomData, 'code'>;

        // Get all players
        const playersRef = ref(db, `rooms/${roomCode}/players`);
        const playersSnapshot = await get(playersRef);

        if (!playersSnapshot.exists()) {
          setError('No players in room');
          return false;
        }

        const playersData = playersSnapshot.val() as Record<string, Omit<Player, 'uid'>>;
        const playerUids = Object.keys(playersData);

        if (playerUids.length < 2) {
          setError('Need at least 2 players to start');
          return false;
        }

        // Randomly select Rustam
        const rustamUid = playerUids[Math.floor(Math.random() * playerUids.length)];

        // Assign roles to all players
        const roleUpdates: Record<string, unknown> = {};

        playerUids.forEach((uid) => {
          const isRustam = uid === rustamUid;
          roleUpdates[`rooms/${roomCode}/roles/${uid}`] = {
            isRustam,
            theme: isRustam ? null : 'Kitchen Appliances', // Will be set by host later
          };
        });

        // Update room status and Rustam ID
        roleUpdates[`rooms/${roomCode}/status`] = 'active';
        roleUpdates[`rooms/${roomCode}/rustamUid`] = rustamUid;
        roleUpdates[`rooms/${roomCode}/currentRound`] = (roomData.currentRound || 0) + 1;

        // Execute all updates
        const updates = { ...roleUpdates };
        await Promise.all(
          Object.entries(updates).map(([path, value]) => set(ref(db, path), value))
        );

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Reveal the Rustam
  const revealRustam = useCallback(async (roomCode: string): Promise<boolean> => {
    if (!auth.currentUser) {
      setError('Not authenticated');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const roomRef = ref(db, `rooms/${roomCode}`);
      await set(roomRef, { ...room, status: 'revealed' }, { merge: true });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [room]);

  const leaveRoom = useCallback((): void => {
    setRoom(null);
    setPlayers([]);
    localStorage.removeItem('rustam_host_room');
    localStorage.removeItem('rustam_player_room');
    localStorage.removeItem('rustam_player_uid');
  }, []);

  const value: RoomContextType = {
    room,
    players,
    loading,
    error,
    createRoom,
    joinRoom,
    subscribeToRoom,
    restoreHostSession,
    restorePlayerSession,
    startRound,
    revealRustam,
    leaveRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
