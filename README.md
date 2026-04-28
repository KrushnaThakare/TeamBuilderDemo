# Cricket Team Builder

Mobile-first real-time cricket team builder built with React, Vite, and Firebase Firestore.

## Features

- Dynamic player list with photo URLs
- Search bar with live autocomplete suggestions
- Team A and Team B selection with captain assignment
- Duplicate-safe player selection and team swapping
- Real-time Firestore sync across devices
- Match reset that clears teams, captains, and scores
- Simple two-innings scorecard with winner calculation
- Responsive card-based cricket theme
- Loading and error states

## Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file from the example values below and fill in your Firebase web app config:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Firebase

The app stores one shared match room at:

- `matches/default`
- `matches/default/players`

Firestore rules should allow the intended users to read and write these documents.

## Netlify

Use the following build settings:

- Build command: `npm run build`
- Publish directory: `dist`

Add the `VITE_FIREBASE_*` values in Netlify environment variables before deploying.
