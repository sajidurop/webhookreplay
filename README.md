Looking for more useful tools? Discover what else you can build with → [AllToolFree](https://alltoolfree.site)

# WebhookReplay

**Debug webhooks without the guesswork.**

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) ![Made by Sajidur](https://img.shields.io/badge/Created%20by-Sajidur-blue) ![Run: npm start](https://img.shields.io/badge/Run-npm%20start-brightgreen)

## What problem it solves

Capture webhook events, inspect headers and payloads, search and filter them, and replay events to a target URL to compare responses.

## Why it exists

Developers and small teams need this check constantly, but most tools for it are paid, hosted, or collect your data. WebhookReplay is a real, working tool you run yourself: `npm start` launches its own server, which does the actual work (live fetching, checks, webhooks, queue) and stores history on disk. Open `index.html` directly and it still works in browser-only mode, with history in localStorage. No account, no tracking.

## Main features

- Real, working core functionality — see "How it works" below. Nothing is faked.
- History stored locally in your browser, with JSON/CSV export where applicable.
- Responsive, clean light theme with its own visual identity.
- Works offline, except for features that fetch a URL or public API **you** enter.
- Creator attribution in the footer and About dialog, linking to [Sajidur](https://alltoolfree.site) and [AllToolFree](https://alltoolfree.site).

## How it works

Paste a webhook payload (JSON) and capture it. Inspect it, search it, then replay it to any target URL you control and compare the response status and body. Events are stored locally with a 200-event retention cap.

## Screenshots

> Screenshots are not bundled yet — open `index.html`, run the tool once, and take a screenshot of your own run to add here. Do not use placeholder or stock screenshots.

## Architecture overview

A real client + server app. `server.js` (Node.js, zero dependencies) serves the UI and exposes a real API (`POST /api/check`, `GET /api/health`, `GET /api/history`) that does the actual work server-side — live URL fetching, crawling, DNS lookups, webhook receiving, queue processing — and persists results in `data/` as JSON files. `index.html` is the UI: when served by the server it calls the API; opened directly, it falls back to browser-only mode. `brand.json` holds the central creator/brand configuration.

## Running the real server

```bash
npm start
# → http://localhost:3000
```

No dependencies to install — the server uses only Node built-ins. Copy `.env.example` to `.env` only if the tool needs an API key (see Environment variables).

## Technology stack

- Node.js server (`server.js`, zero dependencies, Node ≥ 18): serves the UI, runs the real checks, stores history in `data/`.
- HTML + CSS + vanilla JavaScript (no framework, no build tool, no dependencies to install).
- Browser APIs only: `fetch`, `FileReader`, `canvas`, `localStorage`, `PerformanceObserver`, `WebCrypto` (where the feature needs them).
- Public APIs used only when you enter a URL/key: OSV (`api.osv.dev`), npm registry, GitHub API, Google DNS-over-HTTPS, and the LLM provider you choose. Each is documented in the app itself.

## Complete folder structure

```
webhookreplay/
├── server.js       # the real server (Node, zero deps) — API + static hosting
├── package.json    # npm start → node server.js
├── Dockerfile      # docker build -t webhookreplay . && docker run -p 3000:3000 webhookreplay
├── .env.example    # copy to .env for API keys (never commit .env)
├── index.html      # the whole UI (markup + CSS + JS, calls /api when served)
├── brand.json      # central brand configuration (creator, GitHub, website)
├── README.md       # this file
├── LICENSE         # MIT
├── data/           # history on disk (created at runtime, git-ignored)
└── .gitignore
```

## Prerequisites

Node.js 18+ (for the server) and any modern browser (Chrome, Firefox, Safari, Edge). No database — history is stored as JSON files in `data/`.

## Installation

```bash
git clone https://github.com/sajidurop/webhookreplay.git
cd webhookreplay
npm start
# open http://localhost:3000
```

> The repository above is the intended repo name for this project. If you publish it under a different name, update the clone URL here and the "View source" link in `index.html` / `brand.json`.

## Local development

```bash
npm start
# open http://localhost:3000
```

Edit `index.html` (UI) or `server.js` (API) directly; restart the server to see server changes. Browser-only mode still works: open `index.html` directly, or `python3 -m http.server 8000` — the app detects whether its server is running and falls back automatically.

## Environment variables

Copy `.env.example` to `.env`. `PORT` (default 3000) is the only variable every project uses. Some projects accept provider keys from the environment (e.g. `OPENAI_API_KEY`, `GITHUB_TOKEN`) so keys never have to go through the browser; keys entered in the UI are sent only to the provider you selected and are **never stored**.

## Configuration

All creator/brand links live in one place: `brand.json` and the `BRAND` object at the top of the `<script>` in `index.html`. Change them there and every attribution in the app follows.

## API documentation

The server exposes a real HTTP API:

- `GET /api/health` — server status.
- `POST /api/check` — run the tool's main check (JSON body; the server does the real work and returns genuine results).
- `GET /api/history` — past runs stored on disk.

Some projects add their own endpoints (e.g. `POST /webhook/*` receivers, `GET /api/snapshots`, `GET /api/runs`) — see `server.js` for the full list. External APIs (OSV, npm registry, GitHub, Google DNS, your chosen LLM provider) are called server-side, only after you supply the URL or key.

## CLI commands

```bash
npm start    # run the server on http://localhost:3000
node --check server.js   # syntax-check the server
```

History and results also export as JSON/CSV from inside the app.

## Usage examples

1. Open `index.html`.
2. Follow the "How it works" steps above.
3. Export your results (JSON/CSV button in the app) to keep a record.

## Testing

Manual verification checklist (run before publishing):

1. Open `index.html` — the page loads with no console errors.
2. Run the core flow once with real input (see "How it works").
3. Reload the page — history from the previous run is still there (localStorage).
4. Click the footer links — "Created by Sajidur" and "More free tools" both open https://alltoolfree.site, and "View source on GitHub" opens the repo under github.com/sajidurop once it is created.
5. Export once — the downloaded file contains your real results.
6. Server check: `npm start`, then open http://localhost:3000/api/health — it returns ok, and the UI shows a “● Live server” badge.

## Docker setup

```bash
docker build -t webhookreplay .
docker run -p 3000:3000 webhookreplay
```

## Self-hosting and deployment

- **Any VPS / Docker:** `docker build -t {slug} . && docker run -p 3000:3000 {slug}`, or `npm start` behind a reverse proxy.
- **Render / Railway / Fly.io:** connect the repo; start command is `node server.js`.
- **Static only (browser mode):** GitHub Pages / Vercel / Netlify serve `index.html` as-is — live server features are unavailable in this mode.

## Security and privacy

- No credentials, tokens or secrets are committed or stored. API keys entered in the UI are kept in memory for that session only.
- No tracking scripts, no analytics, no external requests except the ones you trigger by entering a URL/API.
- Values that look like secrets are masked on screen where applicable (see the app).
- Cross-origin fetching is limited by the target site's CORS policy — that is a browser security feature, not a bug. Where a fetch is blocked, the app offers a paste-HTML/XML/JSON alternative.

## Known limitations

- In browser-only mode (opening `index.html` directly), browser CORS rules still limit live URL checks; the app offers a paste-based alternative there. Running `npm start` removes this limit — the server fetches URLs directly.
- In browser-only mode, history lives in localStorage and does not sync across devices. With the server running, history is stored on disk in `data/`.
- Features that need a paid/public API (LLM calls, OSV, npm registry) need internet access and, where applicable, your own key.
- No feature in this app fabricates results: if a live check cannot run, the app says so instead of showing made-up numbers.

## Roadmap

- [ ] Add real screenshots to this README.
- [ ] Add an optional shareable export format per run.
- [ ] Add keyboard shortcuts for the main action.

## Contributing

Issues and pull requests are welcome. Keep changes small, keep the app dependency-free, and keep the creator attribution intact.

## License

MIT — see [LICENSE](LICENSE).

## Credits

Created by [Sajidur](https://alltoolfree.site). More free tools: [AllToolFree](https://alltoolfree.site). Source code (once published): [github.com/sajidurop](https://github.com/sajidurop).
