# The Rustam: Party Game PWA

## Overview

Mobile PWA for running "The Rustam" party game. Host device controls game; 10-12 players join via room code. Each round, players receive either the secret theme or "You are the Rustam" assignment simultaneously.

**Target**: Build in 4-6 hours using Firebase

## Architecture Decisions

### Technology Stack
- pnpm + Vite + React
- Tailwind CSS
- Firebase Realtime Database + Anonymous Auth
- Cloudflare Pages (manual CLI deploy)

### Database: Firebase Realtime Database Only
Using RTDB for everything (not Firestore). Reasons:
- Optimized for <500ms real-time sync (core requirement)
- Simpler mental model for a time-boxed build
- Free tier sufficient for party game scale

### State Persistence & Reconnection
Players and host must be able to:
- Refresh page and resume seamlessly
- Reconnect after network drop without losing game position
- Rejoin room if kicked due to transient issues

**Approach**:
- Store `roomCode` and `playerId` in localStorage after joining
- On app load, check localStorage and attempt to rejoin if valid
- Firebase anonymous auth UID persists automatically
- Player's game state lives in RTDB, not local state

### Security Model
Nobody knows who the Rustam is until reveal—not even the host. Host can participate as a regular player.

Each player has their own path in RTDB that only they can read:

```text
rooms/{roomCode}/
  status: "lobby" | "active" | "revealed" | "ended"
  hostUid: "..."
  currentRound: 1
  totalRounds: 4
  currentTheme: "Kitchen Appliances"
  rustamUid: "..."  // NO ONE can read until status="revealed"

  players/{uid}/
    name: "Amit"
    joinedAt: timestamp

  roles/{uid}/      // each player can only read their own
    isRustam: true/false
    theme: "Kitchen Appliances"  // null if Rustam
```

Security rules enforce:

- `roles/{uid}` readable only by that uid
- `rustamUid` readable by NO ONE until `status` = "revealed"
- When `status` = "revealed", `rustamUid` becomes public

### Deployment
Manual deploy via Wrangler CLI to Cloudflare Pages. Instructions provided in task.

## Risk Register

| Risk | Severity | Status | Mitigation |
|------|----------|--------|------------|
| Real-time sync latency >500ms | Critical | Unproven | Test with RTDB; measure with 4+ browser tabs |
| Security rules can't hide roles per-player | Critical | Unproven | Prototype in Task 1.4 before building UI |
| Player reconnection edge cases | Medium | Known | Store room/player in localStorage; handle gracefully |
| Room code collision | Low | Known | Simple retry logic |

## Milestones

### Milestone 1: Core Real-Time Infrastructure (MVP)
**Goal**: Host creates room, players join, full game loop works with proper role secrecy and reconnection.

**Tasks** (in pending/):
1. Project setup (Vite + React + Tailwind + Firebase + pnpm)
2. Room creation with collision-safe 4-digit code
3. Player join flow with real-time list and reconnection support
4. Role assignment with security rules (HIGH RISK - prototype first)
5. Role reveal screen (green theme vs red Rustam)
6. Round cycling and game flow
7. Cloudflare Pages deployment

**Success Criteria**:

- Minimum: 2+ players join, see roles simultaneously, host reveals Rustam, can play multiple rounds
- Complete: Reconnection works, security rules proven, deployed to Cloudflare

### Milestone 2: Game Polish & UX (Future)
Theme selection, question sheets, PWA manifest, visual polish per PRD specs.

## Deferred Items

| Item | Rationale | Target |
|------|-----------|--------|
| Theme selection UI | Not needed for core loop | M2 |
| Host question sheet | Enhancement | M2 |
| PWA manifest | Polish | M2 |
| Mobile viewport enforcement | Polish | M2 |
| Room TTL/cleanup | Nice-to-have | Post-MVP |

## Progress

- [ ] Milestone 1: Core Real-Time Infrastructure
- [ ] Milestone 2: Game Polish & UX