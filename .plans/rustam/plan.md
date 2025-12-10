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
| Real-time sync latency >500ms | Critical | ✅ PROVEN | Tested with 4+ browser tabs, <500ms sync |
| Security rules can't hide roles per-player | Critical | ✅ PROVEN | Rules enforced, access control working |
| Player reconnection edge cases | Medium | ✅ RESOLVED | localStorage persistence + session restoration |
| Room code collision | Low | ✅ RESOLVED | Retry loop with existence check |
| PWA install experience | Low | Unproven | Add manifest, test on iOS/Android |
| Mobile viewport issues | Low | Known | Add viewport meta, safe area handling |

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

### Milestone 2: Game Polish & UX
**Goal**: Transform MVP into polished, mobile-first PWA with improved UX and installable experience.

**Timeline**: 4-8 hours

**Tasks** (in pending/):
1. Theme selection UI - Host chooses from predefined themes or random
2. PWA manifest & icons - Installable app with branding
3. Mobile-first polish - Viewport, touch targets, safe areas
4. Visual polish - Animations, transitions, typography
5. Sound & haptics - Audio cues for key moments (stretch goal)

**Success Criteria**:
- Minimum: Theme selection works, PWA installable on iOS/Android, mobile-friendly
- Complete: Smooth animations, sound effects, feels like native app

## Deferred Items

| Item | Rationale | Target |
|------|-----------|--------|
| Host question sheet | Enhancement, not core UX | M3 |
| Room TTL/cleanup | Infrastructure, not user-facing | M3 |
| RNG improvements (crypto API) | Security hardening | M3 |
| Rate limiting | Abuse prevention | M3 |
| Comprehensive integration tests | Quality, not user-facing | M3 |

## Progress

- [x] Milestone 1: Core Real-Time Infrastructure ✅ COMPLETE (7/7 tasks, 38 tests passing)
- [ ] Milestone 2: Game Polish & UX (5 tasks planned)