// ABOUTME: Context for managing room state and operations
// ABOUTME: Handles room creation, player management, and game state

import { createContext, useState, useCallback } from 'react';
import { ref, set, get, onValue } from 'firebase/database';
import { db, auth } from '../lib/firebase';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate a unique 4-digit room code
  const generateRoomCode = useCallback(async () => {
    let code;
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
  const createRoom = useCallback(async (totalRounds = 4) => {
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
        status: 'lobby',
        currentRound: 0,
        totalRounds,
        createdAt: now,
      };

      const roomRef = ref(db, `rooms/${roomCode}`);
      await set(roomRef, roomData);

      // Store in localStorage for reconnection
      localStorage.setItem('rustam_host_room', roomCode);

      const newRoom = { code: roomCode, ...roomData };
      setRoom(newRoom);

      return roomCode;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateRoomCode]);

  // Join an existing room as a player
  const joinRoom = useCallback(async (roomCode, playerName) => {
    setLoading(true);
    setError(null);

    try {
      const playerUid = auth.currentUser.uid;
      const roomRef = ref(db, `rooms/${roomCode}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Room not found');
        return false;
      }

      const roomData = snapshot.val();
      if (roomData.status !== 'lobby') {
        setError('Room is not in lobby state');
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
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen to room updates
  const subscribeToRoom = useCallback((roomCode) => {
    if (!roomCode) return () => {};

    const roomRef = ref(db, `rooms/${roomCode}`);
    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoom({ code: roomCode, ...snapshot.val() });
      }
    });

    // Listen to players
    const playersRef = ref(db, `rooms/${roomCode}/players`);
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        const playersData = snapshot.val();
        const playersList = Object.entries(playersData).map(([uid, data]) => ({
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
  }, []);

  // Restore host session on load
  const restoreHostSession = useCallback(async () => {
    const savedRoom = localStorage.getItem('rustam_host_room');
    if (savedRoom) {
      const roomRef = ref(db, `rooms/${savedRoom}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        if (roomData.hostUid === auth.currentUser.uid) {
          setRoom({ code: savedRoom, ...roomData });
          return savedRoom;
        }
      }
    }
    return null;
  }, []);

  // Restore player session on load
  const restorePlayerSession = useCallback(async () => {
    const savedRoom = localStorage.getItem('rustam_player_room');
    const playerUid = localStorage.getItem('rustam_player_uid');

    if (savedRoom && playerUid === auth.currentUser.uid) {
      const playerRef = ref(db, `rooms/${savedRoom}/players/${playerUid}`);
      const snapshot = await get(playerRef);
      if (snapshot.exists()) {
        return savedRoom;
      }
    }
    return null;
  }, []);

  const leaveRoom = useCallback(() => {
    setRoom(null);
    setPlayers([]);
    localStorage.removeItem('rustam_host_room');
    localStorage.removeItem('rustam_player_room');
    localStorage.removeItem('rustam_player_uid');
  }, []);

  return (
    <RoomContext.Provider
      value={{
        room,
        players,
        loading,
        error,
        createRoom,
        joinRoom,
        subscribeToRoom,
        restoreHostSession,
        restorePlayerSession,
        leaveRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export { RoomContext };
