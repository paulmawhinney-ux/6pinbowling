# 6 Pin Bowling Scorer

A family scorekeeping app for 6-pin bowling. Built with React + Vite, hosted free on GitHub Pages, no sign-in or backend — each person's game history lives in their own browser.

**Live app:** `https://YOUR-GITHUB-USERNAME.github.io/6pinbowling/`
(replace `YOUR-GITHUB-USERNAME` once it's deployed — see below)

## Rules this app scores

- 10 frames, 2 throws per frame, 6 pins per frame (max).
- **Strike** — all 6 pins on throw 1; frame ends immediately, bonus = next 2 throws.
- **Spare** — all 6 pins across throws 1 + 2; bonus = next 1 throw.
- **10th frame** — an extra (3rd) throw is awarded if you strike on throw 1 or spare on throws 1–2.
- **Perfect game** — 12 strikes in a row, scoring 180 (the 6-pin equivalent of 10-pin's 300).

## Features

- Multiple players per game, entered fresh each time (no accounts).
- Tap-to-enter pin counts, automatically capped at pins still standing.
- Live scoresheet with running totals, styled like a real paper scoresheet.
- Game history — last 4 games saved per browser/device.
- Rolling average score per player across those games.

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and publishes automatically on every push to `main`.

**One-time setup after creating the repo on GitHub:**

1. Push this code to a repo named `6pinbowling` on your GitHub account.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or re-run the workflow from the **Actions** tab) — the site will publish to:
   `https://YOUR-GITHUB-USERNAME.github.io/6pinbowling/`
5. Share that link with your family. Everyone opens it in their own phone's browser.

If you ever rename the repo, update the `base` path in `vite.config.js` to match.

## Notes on data storage

Each person's game history and averages are stored **only in their own browser** (localStorage) — nothing is synced between devices or family members. Clearing browser data or switching phones will lose that history. If you want a backup option later (export/import as a file), that's a reasonable next feature to add.

## Tech stack

- React 19 + Vite
- No backend, no database, no API keys
- Plain CSS (no framework) for the scoresheet/lane-themed design
