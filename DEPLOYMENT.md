# Deployment Guide for The Rustam

## Prerequisites

1. Firebase project already created and configured in `.env.local`
2. Cloudflare account with Pages enabled
3. Wrangler CLI installed (`pnpm add -D wrangler`)

## Firebase Setup

### 1. Deploy Security Rules

The app requires specific Firebase Realtime Database security rules to ensure game integrity:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Realtime Database** → **Rules** tab
4. Copy the entire contents of `FIREBASE_RULES.json`
5. Paste into the Rules editor
6. Click **Publish**

**Important**: Without these rules, the security model breaks. Players will be able to:

- Read the Rustam identity before reveal
- Read other players' roles
- Write to role assignments (cheating)

## Cloudflare Pages Deployment

### First Time Setup

```bash
# Install Wrangler if not already installed
pnpm add -D wrangler

# Authenticate with Cloudflare (opens browser login)
wrangler login

# Create Cloudflare Pages project
wrangler pages project create rustam

# Deploy
pnpm deploy
```

### Subsequent Deployments

```bash
# Simple one-liner
pnpm deploy

# Or manually
pnpm build
wrangler pages deploy dist
```

### Deployment Output

You'll get a URL like:

```
✓ Deployment successful!
✓ https://rustam-xxxx.pages.dev
```

Share this URL with players. They can:

- Open it on their phones
- Scan the host's QR code (which will link to this URL with room code)
- Join games directly

## Environment Variables

Make sure `.env.local` contains all Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Note**: Vite builds these into the static bundle. This is safe because:

1. Firebase API keys are public (meant for client-side use)
2. They're restricted via Firebase Security Rules
3. Anonymous auth means no sensitive user data is exposed

## Testing Before Deployment

```bash
# Run locally
pnpm dev

# Test with multiple browsers/devices
# 1. Open http://localhost:5173 in multiple tabs
# 2. One as host, others as players
# 3. Verify QR code works
# 4. Test room creation and joining
# 5. Verify security rules work (can't read rustamUid before reveal)

# Build test
pnpm build
pnpm preview
```

## Troubleshooting

### Players can see Rustam before reveal

→ Firebase Security Rules not deployed. See "Deploy Security Rules" section above.

### QR code doesn't work

→ Make sure the app is deployed to a real URL (not localhost)
→ QR code encodes the full deployment URL with room code

### Can't connect to Firebase

→ Check `.env.local` has correct credentials
→ Verify Firebase project is active (not deleted)
→ Check that Anonymous Auth is enabled in Firebase

### Deployment fails

→ Run `wrangler login` to re-authenticate
→ Make sure project exists: `wrangler pages project list`
→ If missing, create with: `wrangler pages project create rustam`

## Next Steps

After deployment:

1. Test with real phones/devices
2. Play a full game to verify all flows
3. Check Firebase Console to see live game data
4. Monitor for any errors in browser console

Enjoy The Rustam! 🎉
