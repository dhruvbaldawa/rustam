# 🎭 The Rustam

A real-time multiplayer party game PWA where players try to identify the "Rustam" — the one person who doesn't know the secret theme!

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?logo=firebase&logoColor=black)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?logo=cloudflare&logoColor=white)

## 🎮 How It Works

1. **Host** creates a room and gets a 4-digit code
2. **Players** (10-12) join via room code on their phones
3. Each round, one player is secretly chosen as the **Rustam**
4. Regular players see the theme (e.g., "Kitchen Appliances")
5. The Rustam sees only: "YOU ARE THE RUSTAM" — no theme!
6. Players take turns answering questions, trying to blend in
7. Everyone votes on who they think the Rustam is
8. Reveal the Rustam and start the next round!

## ✨ Features

- 📱 **Mobile-first PWA** — No app store needed, works on any phone
- ⚡ **Real-time sync** — Instant role reveals across all devices
- 🎯 **Pre-loaded themes** — 100+ questions across multiple themes
- 🔐 **Secure roles** — Players can't peek at others' roles
- 🎨 **Immersive UI** — Full-screen color reveals (green for safe, red for Rustam)
- 📷 **QR code sharing** — Easy room joining for players

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Firebase project with Realtime Database

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruvbaldawa/rustam.git
cd rustam

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

### Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components (Button, Card, etc.)
├── contexts/          # React contexts (Game state)
├── hooks/             # Custom React hooks
├── lib/               # Core utilities (Firebase, game logic, themes)
├── pages/
│   ├── host/          # Host-specific screens (Lobby, Game, ThemeSelection)
│   └── player/        # Player-specific screens (Join, Waiting, RoleReveal)
└── __tests__/         # Unit and integration tests
```

## 🎯 Game Screens

| Screen | Description |
|--------|-------------|
| **Home** | Choose between Host or Join game |
| **Lobby** | Host sees room code + QR code, players join |
| **Theme Selection** | Host picks which theme to play |
| **Role Reveal** | Players see their role (theme or Rustam) |
| **Game Active** | Host controls flow, reads questions |
| **Rustam Revealed** | Show who the Rustam was |

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase Realtime Database
- **Auth**: Firebase Anonymous Auth
- **Hosting**: Cloudflare Pages
- **Testing**: Vitest + React Testing Library

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

```bash
# Quick deploy to Cloudflare Pages
pnpm deploy
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## 📖 Documentation

- [Design Document](./DESIGN.md) — Full PRD with user flows and technical specs
- [Deployment Guide](./DEPLOYMENT.md) — Firebase + Cloudflare setup instructions

## 🎲 Sample Themes

- Kitchen Appliances
- Bollywood Movies
- Things at an Indian Wedding
- Indian Street Food
- Cricket Equipment
- Things in a Puja Room
- Desi Parent Complaints
- ...and many more!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public distribution.

---

<p align="center">
  Made with ❤️ for party game enthusiasts
</p>
