# SB News — Vite + React (frontend-only)

A full rebuild of the SB News app on **Vite** (no CRA), with a distinct
glass/neumorphic UI, every item from your checklist wired up, powered
directly by **newsdata.io** — no backend, just the React app.

## Run it in VS Code

```bash
cd sbnews
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`). A
`.env` is already included with your newsdata.io key, so it works out of
the box.

## About "too many requests"

newsdata.io's free plan has **two** limits, and the short one is the one
that was actually tripping you up:
- **200 credits/day** (1 credit = 1 request = up to 10 articles)
- **30 credits per 15 minutes** — this shorter burst window is what
  triggers "too many requests" when several parts of the app fetch at
  once (e.g. the Dashboard's 7 category charts, or Home's 3 category
  previews on first load).

Since there's no backend anymore, all of the protection against this
lives in `src/api/newsApi.js`:

- **Cache** — every unique request (country + category + query) is kept
  in memory for 20 minutes and reused instead of re-fetching.
- **Queue** — every outgoing request is spaced out by 1.5 seconds, so
  bursts of several calls go out one at a time instead of all at once.
- **De-duplication** — if the same request is already in flight, a
  second caller just waits on it instead of firing a duplicate.

If you still see the rate-limit message, it means you'd already spent
the 15-minute window before this update — wait a few minutes and it'll
clear on its own.

## What's implemented against your checklist

| Item | Where |
|---|---|
| React Vite-only | `vite.config.js`, no `react-scripts` anywhere |
| Responsive design | every `.css` file has breakpoints down to 360px |
| Modern UI (glass / neumorphism / motion / flat / minimal) | `src/styles/theme.css` — dark mode = glassmorphism, light mode = neumorphism, shared flat/minimal card layout, motion on hover/scroll |
| 3rd-party API only | `src/api/newsApi.js` — all data from newsdata.io, called directly from the browser, no backend |
| react-router-dom routing | `src/App.jsx` |
| Authentication | `src/context/AuthContext.jsx` + `/login`, `/signup`, `/profile` (client-side demo auth) |
| Skeleton loaders | `src/components/SkeletonCard.jsx` |
| State management (Context API) | `ThemeContext`, `AuthContext`, `NewsContext` |
| Dark / light mode | toggle in navbar + Settings page |
| Smooth scrolling | `html { scroll-behavior: smooth }` + `ScrollToTop.jsx` on route change |
| Search & filtering | `/search` page |
| Lazy loading | `React.lazy` per route in `App.jsx`, `loading="lazy"` on images |
| Pagination | `CursorPager.jsx` on category & search pages (newsdata.io uses token-based paging, so it's Prev/Next rather than page numbers — see note below) |
| Debounced search | `src/hooks/useDebounce.js` |
| Bar / Line / Pie charts | `/dashboard` ("Trends") page, via `recharts` |
| Toast notifications | `react-toastify`, wired into auth actions |
| Settings / profile page | `/profile` |
| Latest headlines / categories / country-wise / search | Home page hero + ticker, category pages, country selector in navbar (active-link highlighted), search page |
| Active nav highlighting | `Navbar.jsx` uses `NavLink`, styled in `Navbar.css` |

### A note on pagination

newsdata.io paginates with an opaque `nextPage` token instead of page
numbers (unlike the previous GNews setup), so jumping straight to "page
6" isn't possible with this API — `CursorPager.jsx` gives you Prev/Next
instead, which is the best fit for how this API works.

### A note on search sorting

newsdata.io's free plan doesn't support a "sort by" option the way GNews
did, so that dropdown was removed from the search page rather than left
in as a non-functional control.

## Project structure

```
src/
  api/newsApi.js       - all newsdata.io calls + cache + request queue
  context/              - Theme, Auth, News providers
  hooks/useDebounce.js
  components/           - Navbar (active-link highlighting), Footer,
                           Ticker, NewsCard, SkeletonCard, CursorPager,
                           ProtectedRoute, etc.
  pages/                 - Home, CategoryPage, SearchPage, Login, Signup,
                           Profile, Dashboard, NotFound
  styles/theme.css       - all design tokens & theme switching
```

## Notes

- Auth is still front-end only (`localStorage`) — there's no backend to
  attach real accounts to.
- If your browser console ever shows a CORS error instead of a normal
  error banner, it means newsdata.io blocked the direct browser request
  for some reason (e.g. a plan restriction) — in that case a small proxy
  would be needed, but this hasn't come up in testing.
- Country coverage is the same 10-country list as before; the codes
  newsdata.io accepts are broader than that if you want to add more —
  edit `COUNTRIES` in `src/api/newsApi.js`.
