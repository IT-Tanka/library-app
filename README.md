# Library Management SPA

This is a test Vue.js application for managing a library of books and authors.

## Technologies
- Vue 3 (Composition API)
- Pinia for state management
- Vue Router for routing
- Vuetify for UI
- Vue-i18n for internationalization
- TypeScript

## Running the Project
1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev` (uses Vite)
3. Open in your browser: http://localhost:5173

## API Setup
- Data is mocked in `public/db.json` (fetched from '/db.json').
- For a real API: Replace fetch calls in stores (`authors.ts`, `books.ts`) with axios or fetch requests to your backend.
- Authentication: Mocked in localStorage. For real usage — integrate JWT in `auth.ts`.

## Features
- Login/registration on the main page.
- Lists of books/authors with search and pagination (authorized users only).
- Add/edit/delete books and authors.
- Detailed view with edit mode.
- Language switching (en/uk).
- Protected routes.

## Notes
- For production: `npm run build`

