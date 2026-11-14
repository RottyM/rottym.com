# rottym.com

The website of Rotty Mendez's web development business in Reston, VA, live at [rottym.com](https://rottym.com).

## Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Contact form: the contact page posts to a Nodemailer API route at `src/app/api/contact`. The repo also includes `@formspree/react`.
- Deployed to Firebase Hosting via `firebase-frameworks`

## Main pages

- `/` — home
- `/about` — about
- `/services` — services
- `/packages` — packages
- `/portfolio` — work index, plus `/portfolio/[slug]` case studies
- `/contact` — contact
- `src/app/sitemap.ts` and `src/app/robots.ts` — sitemap and robots

## Project structure

```
src/app/           App Router pages, layout, styles, and API routes
src/components/    Shared UI (header, footer, logo, theme provider)
src/lib/           Shared helpers (analytics, project data)
public/            Static assets
firebase.json      Firebase Hosting config
.firebaserc        Firebase project mapping
```

## Getting started

This project requires [Node.js 22](https://nodejs.org/).

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run lint     # ESLint
```

## Environment variables

The application reads these variables from the environment:

- `NEXT_PUBLIC_GA_ID` — Google Analytics measurement ID
- `SMTP_USER` — SMTP username used by the contact API route
- `SMTP_PASS` — SMTP password used by the contact API route

## Deploy

The site deploys to Firebase Hosting. The default project and Hosting setup are defined in `.firebaserc` and `firebase.json` (`source: "."`, with a `frameworksBackend` in `us-central1`).

```bash
firebase deploy
```

Check those two config files for the actual project ID and Hosting details before deploying.
