## ShareBite

ShareBite is a food-sharing platform that connects restaurants, hotels, banquet halls and similar food providers with NGOs. Food providers can post information about surplus edible food (quantity, quality, pickup window, and location). NGOs can browse listings, contact providers, verify food quality, and deliver to people in need. The goal is to reduce food waste and improve redistribution of surplus food.

This repository is a minimal monorepo containing a Vite + React frontend and a Firebase backend. This project is an MVP (minimum viable product) and not production-ready.

## Project Overview

- Purpose: Reduce food waste by connecting surplus-food providers with NGOs who can redistribute the food.
- Scope: MVP to demonstrate core flows: posting listings, browsing, claiming, and basic authentication.

## Tech Stack

- Frontend: Vite + React
- Backend: Firebase (Authentication, Firestore / Realtime Database, Cloud Functions, Hosting)

This project uses Firebase services for backend features instead of a traditional Node/Express server.

## Features (MVP)

- Food providers can create and manage listings describing surplus food (quantity, quality, pickup window, location).
- NGOs can browse listings and view listing details.
- Basic authentication for users (providers and NGOs).
- NGOs can claim listings or contact providers to arrange pickup.
- Simple role-based views: provider dashboard and NGO dashboard.

## Folder Structure


```
shareBite/
├── README.md
├── firebase.json
├── .firebaserc
├── firestore.rules
├── firestore.indexes.json
├── functions/
│   ├── package.json
│   ├── index.js
│   └── src/
│       ├── auth.js
│       ├── listings.js
│       └── claims.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── .env.local
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── firebase.js
        ├── pages/
        │   ├── Home.jsx
        │   ├── Browse.jsx
        │   ├── ListingDetails.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── RestaurantDashboard.jsx
        │   └── NGODashboard.jsx
        └── components/
            ├── ListingCard.jsx
            └── Header.jsx
```

## Getting Started

These steps show a minimal way to run the frontend (Vite) and use Firebase for backend development.

Prerequisites:
- Node.js (LTS) installed
- npm or yarn
- Firebase account and Firebase CLI (optional for emulators and deploy)

1) Firebase (backend)

- If you plan to use Firebase locally, install the Firebase CLI and initialize a project (you only need to do this once):

```powershell
npm install -g firebase-tools
firebase login
firebase init
```

- For local development you can use the Firebase Emulator Suite (recommended):

```powershell
firebase emulators:start
```

- Deploy to Firebase (when ready):

```powershell
firebase deploy
```

2) Frontend (Vite + React)

- Install dependencies and run the Vite dev server:

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend in your browser (Vite typically serves at `http://localhost:5173`). Configure the Firebase settings in your frontend to point to your Firebase project (see Environment variables below).

## Environment variables (frontend)

When using Vite, environment variables that should be exposed to the browser must start with `VITE_`. Create a `.env` (or `.env.local`) file in `frontend/` and add your Firebase configuration values, for example:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For Firebase admin credentials (Cloud Functions or server-side use), keep secrets out of the repo and use the recommended secret management for Firebase or CI/CD.

Keep `.env` out of version control and never commit real secrets.

## Screenshots



---


