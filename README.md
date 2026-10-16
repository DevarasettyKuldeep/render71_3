# Render72 — Curated Campus Events

Live event platform consuming the Render72 Events API (`getAllEvents`, `getEventByID`).

## Setup

```bash
npm install
npm run dev      # development server
npm run build    # production build
npm run preview  # preview build locally
```

## Build
`npm run build` outputs to `dist/`. The production build includes the compiled React app, CSS assets, service worker (`sw.js`), and PWA manifest.

## Deployment (Vercel)
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `.`

## Environment Variables
No `.env` variables required. The API endpoint (`https://render72.pages.dev/api/test/events`) is hardcoded for the hackathon.

## Features
- Landing page and Events page with real-time API data
- Search, category filters, and featured event banner
- Full event detail view (prizes, FAQs, schedules, gallery, rules, organizers, coordinators)
- Responsive design (mobile / tablet / desktop)
- Service worker for offline resilience
- Semantic HTML with accessibility improvements
