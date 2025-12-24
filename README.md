## ShareBite

ShareBite connects food providers (restaurants, hotels, banquets) with NGOs to reduce food waste. Backend is Firebase (Auth, Firestore, Cloud Functions HTTP at `/api`), frontend is Vite + React.

## Current Status

- Repo scaffolded with Firebase config and Functions/Frontend workspaces; API and UI are not yet implemented.
- Node engine for Functions: 20 (install on local machines to match deploy/runtime).

## Folder Structure (target)

```
shareBite/
├─ .firebaserc
├─ firebase.json
├─ firestore.rules
├─ firestore.indexes.json
├─ functions/
│  ├─ package.json
│  ├─ index.js                # exports https API entry
│  └─ src/
│     ├─ auth.js              # /api/auth/* endpoints
│     ├─ listings.js          # /api/listings* endpoints
│     └─ claims.js            # /api/claims* + notifications helpers
└─ Frontend/
   ├─ package.json
   ├─ vite.config.js
   ├─ .env.local              # VITE_BACKEND_URL + VITE_FIREBASE_*
   ├─ index.html
   ├─ public/
   └─ src/
      ├─ main.jsx
      ├─ App.jsx
      ├─ index.css
      ├─ styles/
      │  └─ theme.css
      ├─ firebase.js          # client SDK init (optional)
      ├─ api/
      │  ├─ client.js         # axios base with auth header
      │  ├─ auth.js
      │  ├─ listings.js
      │  └─ claims.js
      ├─ hooks/
      │  ├─ useAuth.js
      │  └─ useFetch.js
      ├─ components/
      │  ├─ Header.jsx
      │  ├─ ListingCard.jsx
      │  └─ shared UI (buttons, badges, etc.)
      ├─ pages/
      │  ├─ Home.jsx
      │  ├─ Browse.jsx
      │  ├─ ListingDetails.jsx
      │  ├─ Login.jsx
      │  ├─ Register.jsx
      │  ├─ RestaurantDashboard.jsx
      │  └─ NGODashboard.jsx
      └─ lib/
         └─ utils.js          # helpers (e.g., className concat)
```

## Prerequisites

- Node 20.x (recommended to match Functions runtime)
- npm
- Firebase CLI (`npm i -g firebase-tools`) for emulators/deploy

## Setup

1) Clone and install
```powershell
git clone <repo-url>
cd shareBite
cd Frontend && npm install
cd ..\functions && npm install
```

2) Env files (frontend)
Create Frontend/.env.local (copy from Frontend/.env.example and fill in your keys) with the required values:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_BACKEND_URL=http://localhost:5001/<project>/us-central1/api
```

3) Run frontend dev server
```powershell
cd Frontend
npm run dev
```
Default: http://localhost:5173

4) Run Firebase emulators (once API is implemented)
```powershell
cd functions
firebase emulators:start
```

5) Deploy (when ready)
```powershell
firebase deploy --only functions,firestore,hosting
```

## Functions config (required for auth/CORS)

Set Firebase Functions runtime config for the web API key (used to sign in with password) and allowed frontend origin:

```powershell
firebase functions:config:set app.apikey="<FIREBASE_WEB_API_KEY>" app.frontend_origin="http://localhost:5173"
```

Deploy or restart emulators after changing config.

## checklist (manual)

- Register users as provider, NGO, and both; verify auto-login and role-based redirects.
- Login with existing user; protected routes redirect to login when unauthenticated.
- Provider: create listing (status = available), view provider dashboard stats, see listing in "my" and public browse.
- Browse: search/filter by food_type/location/status; open listing details.
- NGO: claim available listing; provider sees claim in listing details; NGO sees it in their claims list.
- NGO: submit quality check with media URLs; listing status moves to completed; provider sees updated claim status.
- Notifications: provider receives claim + completion notifications; NGO sees relevant notifications; mark-as-read buttons update state.

## Notes

- Firestore rules currently require authentication; role/ownership checks should be tightened per collection.
- Functions API is now wired; ensure Functions config is set before using auth endpoints.
- Keep secrets out of git; .env.local is for local dev only.


