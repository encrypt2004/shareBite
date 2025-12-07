## ShareBite

ShareBite is a simple food-sharing platform that connects restaurants, hotels, banquet halls and similar food providers with NGOs. Food providers can post information about surplus edible food (quantity, quality, pickup window, and location). NGOs can browse listings, contact providers, verify food quality, and deliver to people in need. The goal is to reduce food waste and improve redistribution of surplus food.

This repository is a minimal monorepo containing a React frontend and a Node/Express backend using MongoDB. This project is an MVP (minimum viable product) and not production-ready.

## Project Overview

- Purpose: Reduce food waste by connecting surplus-food providers with NGOs who can redistribute the food.
- Scope: MVP to demonstrate core flows: posting listings, browsing, claiming, and basic authentication.

## Tech Stack

- Frontend: React
- Backend: Node.js + Express
- Database: Not decided yet

## Features (MVP)

- Food providers can create and manage listings describing surplus food (quantity, quality, pickup window, location).
- NGOs can browse listings and view listing details.
- Basic authentication for users (providers and NGOs).
- NGOs can claim listings or contact providers to arrange pickup.
- Simple role-based views: provider dashboard and NGO dashboard.

## Folder Structure

shareBite/
├─ README.md
├─ frontend/
│  ├─ package.json
│  ├─ public/
│  └─ src/
     ├─ index.js
     ├─ App.js
     ├─ pages/
     │  ├─ Home.jsx
     │  ├─ Browse.jsx
     │  ├─ ListingDetails.jsx
     │  ├─ Login.jsx
     │  ├─ Register.jsx
     │  ├─ RestaurantDashboard.jsx
     │  └─ NGODashboard.jsx
     └─ components/
        ├─ ListingCard.jsx
        └─ Header.jsx

└─ backend/
   ├─ package.json
   ├─ .env
   ├─ server.js
   ├─ config/
   │  └─ db.js
   ├─ routes/
   │  ├─ auth.routes.js
   │  ├─ listings.routes.js
   │  └─ claims.routes.js
   ├─ controllers/
   │  ├─ auth.controller.js
   │  ├─ listings.controller.js
   │  └─ claims.controller.js
   ├─ models/
   │  ├─ user.model.js
   │  ├─ listing.model.js
   │  └─ claim.model.js
   └─ middleware/
      ├─ auth.middleware.js
      └─ error.middleware.js

## Screenshots
![Restaurant Dashboard](screenshots/restaurant-dashboard.png)



---

