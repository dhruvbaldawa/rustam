# The Rustam: Party Game App — PRD

## Overview

A mobile PWA for running "The Rustam" party game. One host device controls the game; 10-12 players join via room code on their own phones. Each round, players receive either the secret theme or "You are the Rustam" assignment simultaneously on their devices.

**Target:** Build in 4-6 hours using Firebase (Firestore + Realtime DB)

---

## User Types

| User | Device | Role |
|------|--------|------|
| **Host** | Their phone | Creates room, selects themes, controls round flow, sees who the Rustam is |
| **Player** | Their phone | Joins room, receives role assignment, waits between rounds |

---

## Core User Flows

### Flow 1: Host Creates Game

```
Host opens app
    → Taps "Host Game"
    → App generates 4-digit room code (e.g., "7294")
    → Host sees lobby with room code displayed large
    → Host sees player list updating as people join
    → Host selects number of rounds (3-5)
    → When ready, taps "Start Game"
```

### Flow 2: Player Joins Game

```
Player opens app
    → Taps "Join Game"
    → Enters 4-digit room code
    → Enters their name (first name only, max 10 chars)
    → Sees "Waiting for host to start..."
    → Player list visible while waiting
```

### Flow 3: Round Execution

```
Host taps "Start Round"
    → Host selects theme from list (or app auto-selects next theme)
    → App randomly assigns one player as Rustam
    → ALL player screens update simultaneously:
        - 11 players see: "Theme: [Kitchen Appliances]" (green)
        - 1 player sees: "YOU ARE THE Rustam" (red, no theme)
    → Host screen shows: Theme + who the Rustam is (for reference)
    → Host runs the questioning phase verbally (not in app)
    → When ready, Host taps "Start Vote" (optional — or just do voting verbally)
    → Host taps "Reveal Rustam" → All screens show who the Rustam was
    → Host taps "Next Round" → Cycle repeats
```

### Flow 4: Game End

```
After final round:
    → Host taps "End Game"
    → All players see "Game Over" screen
    → Room is closed
```

---

## Screen Specifications

### Host Screens

**H1: Home**

- "Host Game" button (primary)
- "How to Play" link (optional, low priority)

**H2: Lobby**

- Room code displayed LARGE (e.g., "7294") — easy to read across the room
- Subtext: "Players join at [app-url]"
- Player list (updates in real-time as players join)
- Player count: "8 / 12 players"
- "Start Game" button (enabled when 4+ players)
- "Settings" gear icon → select number of rounds

**H3: Theme Selection**

- List of available themes (checkboxes for which to include)
- "Start Round" button
- Or: Auto-rotate through pre-selected themes

**H4: Round Active (Host View)**

- Current theme displayed
- "The Rustam is: [Player Name]" — visible only to host
- Round number: "Round 2 of 4"
- "Reveal Rustam" button
- "Next Round" button (appears after reveal)

**H5: Game Over**

- "Game Complete" message
- "New Game" button → returns to H2 with same room code
- "Exit" button → returns to H1

---

### Player Screens

**P1: Home**

- "Join Game" button (primary)
- "How to Play" link (optional)

**P2: Join**

- 4-digit code input (large number pad style)
- Name input (first name, max 10 chars)
- "Join" button

**P3: Lobby (Waiting)**

- "Waiting for host to start..."
- Player list (real-time)
- Their own name highlighted

**P4: Role Reveal**

- **If NOT Rustam:**
  - Green background
  - "Theme:" label
  - Theme name large (e.g., "Kitchen Appliances")
  - Small lock icon or text: "Keep this secret!"

- **If Rustam:**
  - Red background
  - "YOU ARE THE Rustam" large
  - "Figure out the theme. Blend in." subtext
  - No theme shown

**P5: Round Over**

- "The Rustam was: [Name]"
- "Waiting for next round..."

**P6: Game Over**

- "Game Over — Thanks for playing!"
- "Play Again" button → returns to P1

---

## Data Model (Firestore)

```
rooms/
  {roomCode}/                visibleToPlayers
    status: "lobby" | "active" | "ended"
    hostId: "{odId}"
    currentRound: 1
    totalRounds: 4
    currentTheme: "Kitchen Appliances"
    RustamPlayerId: "{playerId}"          // only readable by host
    revealRustam: false                    // when true, players can see RustamPlayerId

    players/
      {playerId}/
        name: "Amit"
        joinedAt: timestamp
        isRustam: false                    // set each round, readable by that player only
```

**Security Rules Logic:**

- `RustamPlayerId` readable only by host until `revealRustam: true`
- Each player can only read their own `isRustam` field
- When `revealRustam` flips to `true`, `RustamPlayerId` becomes readable by all

---

## Real-Time Sync Requirements

| Event | Trigger | Who Updates | Who Receives |
|-------|---------|-------------|--------------|
| Player joins | Player submits code + name | Player writes to `players/` | Host sees new player in list |
| Round starts | Host taps "Start Round" | Host writes theme + RustamPlayerId | All players receive role |
| Rustam reveal | Host taps "Reveal" | Host sets `revealRustam: true` | All players see Rustam identity |
| Game ends | Host taps "End Game" | Host sets `status: "ended"` | All players see Game Over |

**Latency Target:** < 500ms for role reveal (critical moment)

---

## Theme Data

Pre-loaded in app (no backend needed for themes):

```javascript
const themes = [
  { id: 1, name: "Kitchen Appliances", difficulty: "easy" },
  { id: 2, name: "Vehicles", difficulty: "easy" },
  { id: 3, name: "Furniture", difficulty: "easy" },
  { id: 4, name: "Things at an Indian Wedding", difficulty: "medium" },
  { id: 5, name: "Cricket Equipment", difficulty: "medium" },
  { id: 6, name: "Bollywood Movies", difficulty: "medium" },
  { id: 7, name: "Indian Street Food", difficulty: "hard" },
  { id: 8, name: "Monsoon Things", difficulty: "hard" },
  { id: 9, name: "Things in a Puja Room", difficulty: "hard" },
  { id: 10, name: "Desi Parent Complaints", difficulty: "hard" },
];
```

---

## Host Question Sheet (In-App Reference)

Each theme includes 15 pre-written questions for the host to read aloud. Stored locally, displayed on Host screen during active round.

```javascript
const questionSets = {
  "Kitchen Appliances": [
    { type: "hotSeat", question: "How often do you use yours?" },
    { type: "hotSeat", question: "Is yours loud?" },
    { type: "physical", question: "Is yours expensive?", format: "thumbs" },
    // ... 12 more
  ],
  // ... other themes
};
```

Host screen shows a scrollable list or "Next Question" button to step through.

---

## Technical Specs

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Platform** | PWA (mobile-only) | No app store, instant access via URL |
| **Frontend** | React + Vite | Fast build, simple |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Backend** | Firebase | Realtime DB for sync, Firestore for structure, free tier sufficient |
| **Auth** | Anonymous Firebase Auth | No login needed; host gets hostId, players get odId |
| **Hosting** | Cloudflare pages | Free, fast CDN |

---

## PWA Requirements

- **Mobile-only:** If viewport > 500px, show "Please open on mobile device"
- **Add to Home Screen:** Proper manifest.json for installability
- **Offline:** Not required — game needs real-time sync anyway
- **Orientation:** Portrait lock preferred

---

## Room Code Logic

- 4 digits, numeric only (easy to say aloud)
- Generated randomly, check for collision in Firestore
- Room expires after 2 hours of inactivity (cleanup via Cloud Function or TTL)

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Player joins mid-round | Waits until next round; shown "Round in progress, please wait" |
| Player disconnects | Remains in player list; host can manually remove if needed |
| Host disconnects | Game pauses; host can rejoin with same hostId (anonymous auth persists) |
| Same name twice | Allow it — use odId internally, display name is just visual |
| Room code collision | Regenerate code until unique |

---

## Out of Scope (V1)

- Scoring / leaderboard in app (do verbally or on paper)
- In-app voting (do verbally with pointing)
- Sound effects
- Animations beyond basic transitions
- Desktop support
- Multiple language support

---

## Design Notes

**Visual Hierarchy for Role Reveal (Critical Screen):**

The moment players see their role is the peak of the game. Design should be:

- **Full-screen color wash** — Green (safe) vs Red (Rustam) instantly recognizable across the room
- **Theme text LARGE** — readable at arm's length
- **Minimal UI chrome** — no headers, footers, or distractions
- **No exit button visible** — prevent accidental navigation during round

**Typography:**

- Room code: 64px+ bold monospace
- Role reveal text: 48px+ bold
- Player names: 18-20px

**Colors:**

- Safe player: `#22c55e` (green-500) background, white text
- Rustam: `#ef4444` (red-500) background, white text
- Lobby/neutral: `#1e293b` (slate-800) background

---

## Implementation Priority

**Phase 1 (MVP — 3-4 hours):**

1. Host create room + lobby
2. Player join flow
3. Role assignment + reveal screen
4. Basic round cycling
5. Firebase realtime sync

**Phase 2 (Polish — 1-2 hours):**

1. Host question sheet display
2. Theme selection UI
3. Rustam reveal screen
4. PWA manifest + mobile viewport enforcement

**Phase 3 (Nice to Have):**

1. "How to Play" screen
2. Room expiry cleanup
3. Host kick player option

---

This should be enough to hand off to a Claude Code session or another developer. Want me to also create the host question sheets for all themes, or refine anything in this PRD?
