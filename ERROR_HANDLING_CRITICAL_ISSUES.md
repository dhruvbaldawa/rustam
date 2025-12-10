# Critical Error Handling Issues - Quick Reference

## Top 3 CRITICAL Issues Requiring Immediate Action

### 1. CRITICAL: Unhandled Firebase Listeners (Affects: ALL real-time updates)
- **What:** `onValue()` calls lack error handlers
- **Where:** RoomContext.tsx (lines 183, 192), RoleReveal.tsx (32), useAuth.ts (21)
- **Risk:** Network failure → silent failure → game freezes
- **Example:** Player joins, sees no updates to player list because listener failed silently
- **Fix:** Add error callback to onValue:
  ```typescript
  onValue(ref,
    (snapshot) => { /* success */ },
    (error) => { /* handle error - show user message */ }
  )
  ```

### 2. HIGH: Missing Error Feedback for Game Operations
- **What:** startRound/revealRustam/nextRound/endGame fail but show no error to user
- **Where:** Game.tsx (39-52), Lobby.tsx (119-126), RoomContext (325-429)
- **Risk:** Host thinks operation succeeded when it failed
- **Example:** Click "Reveal Rustam", nothing happens, no error message
- **Fix:** Display context.error in Game.tsx when operations fail

### 3. HIGH: RoleReveal Race Condition (Affects: Every player role reveal)
- **What:** "Getting your role..." loading state can hang indefinitely
- **Where:** RoleReveal.tsx (32-37)
- **Risk:** Player stuck waiting, no timeout or error message
- **Example:** Slow network → role listener doesn't fire → player waits forever
- **Fix:** Add timeout (3-5 seconds) + error message if role doesn't load

---

## Severity Breakdown

| Severity | Count | Issues |
|---|---|---|
| CRITICAL | 1 | Unhandled Firebase listeners across all real-time features |
| HIGH | 6 | Missing operation feedback, race conditions, dependency infinite loops |
| MEDIUM | 3 | Error handling gaps in utility functions |
| LOW | 2 | Minor error display and form submission concerns |

---

## By Task Impact

| Task | Issues | Status |
|---|---|---|
| 1.1 Project Setup | Unhandled auth listener | HIGH |
| 1.2 Room Creation | No timeout on code generation | MEDIUM |
| 1.3 Player Join | Good validation, OK | ✓ |
| 1.4 Role Assignment | Listeners unhandled | CRITICAL |
| 1.5 Role Reveal | Race condition, timeout missing | HIGH |
| 1.6 Round Cycling | Missing error feedback | HIGH |
| 1.7 Deployment | No monitoring for errors | N/A |

---

## What's Working Well

✓ Input validation (Join form)
✓ Business logic validation (player count, round limits)
✓ Try-catch blocks in context operations
✓ Error state management in RoomContext
✓ localStorage session persistence logic

---

## What's Broken

✗ Firebase `onValue()` error handling (CRITICAL)
✗ Game operation UI feedback (HIGH)
✗ Role reveal timeout (HIGH)
✗ RustamRevealed race condition (HIGH)
✗ Lobby useEffect infinite re-render (HIGH)
✗ Network failure resilience (CRITICAL GAPS)

---

## Real-World Impact Scenarios

### Scenario 1: Network Hiccup During Role Assignment
1. Host clicks "Start Game"
2. Firebase network hiccup occurs during role write
3. Context sets error internally
4. UI shows no feedback
5. Host has no idea operation failed
6. Players don't get roles
7. Game appears frozen to everyone

**Prevention:** Show error in Lobby, retry button

### Scenario 2: Player Slow Network During Role Reveal
1. Player navigates to RoleReveal
2. Role listener has network delay
3. "Getting your role..." shows indefinitely
4. No timeout, no error message
5. Player force-refreshes page

**Prevention:** 3-5 second timeout, error message

### Scenario 3: Permission Denied Silently
1. Firebase security rules block role read
2. `onValue()` listener fails with permission error
3. No error callback exists
4. Player sees blank screen forever
5. Player leaves game confused

**Prevention:** Error callbacks + user-facing error message

---

## Files Requiring Changes

**CRITICAL:**
- `/Users/dhruv/Code/mole/src/contexts/RoomContext.tsx` - Add error handlers to onValue calls
- `/Users/dhruv/Code/mole/src/hooks/useAuth.ts` - Add error handler to onAuthStateChanged
- `/Users/dhruv/Code/mole/src/pages/player/RoleReveal.tsx` - Add error handler + timeout

**HIGH PRIORITY:**
- `/Users/dhruv/Code/mole/src/pages/host/Game.tsx` - Display error messages
- `/Users/dhruv/Code/mole/src/pages/host/Lobby.tsx` - Display errors, fix useEffect deps
- `/Users/dhruv/Code/mole/src/pages/player/RustamRevealed.tsx` - Handle missing player name

**MEDIUM PRIORITY:**
- All other components - Add error boundaries, retry UI

---

## Test Coverage Gap

Current tests: 54/54 passing
Missing test coverage: **Error scenarios**
- Network timeouts not tested
- Firebase permission errors not tested
- Missing data race conditions not tested
- Listener failures not tested
- Operation failure feedback not tested

Recommendation: Add error scenario tests alongside happy path tests
