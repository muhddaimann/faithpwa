# FAITH Mobile

FAITH Mobile is the companion application for the FAITH Workspace Platform, providing employees with a modern mobile experience for managing workplace activities anytime and anywhere.

Built with **Expo** and **React Native**, the application focuses on productivity, accessibility, and a consistent enterprise user experience.

---

## Features

- Authentication & secure session handling (JWT, auto kick-out, expiry)
- Home dashboard with session detail (last sign-in + client IP)
- Attendance tracking (scheduled vs actual, operation/manager view)
- Leave application, history & withdrawal
- Newsflash & company announcements
- Room booking, availability & management
- Staff profile view & validated profile update
- Installable Progressive Web App (PWA)
- Reusable overlay system, dynamic theme & design tokens

---

## Tech Stack

- React Native + Expo (Expo Router)
- TypeScript (no `any`, hook-first architecture)
- React Native Paper (Material Design 3)
- Zustand (per-module API stores) + Context API (global state)
- PHP backend (JWT auth, mysqli)
- PWA (web manifest + service worker)

---

## Design System

FAITH Mobile uses a centralized design system powered by:

- `useTheme()` for semantic color management
- `useDesign()` for spacing, radius, typography, sizing, and layout tokens

This provides:

- Consistent UI across the application
- Dark and Light theme support
- Reusable and scalable components
- Maintainable styling architecture

---

## Main Modules

Each module follows the same layered build order:
`constants → helpers → hook → (store/context) → components → screen`.

### 1. Authentication & Session

- Username / password login (JWT bearer token; passwords bcrypt-verified server-side).
- Persistent session: token stored locally and restored on launch, with a
  navigation guard that routes between the login screen and the app tabs.
- **Token expiry enforced** client-side — an expired token is cleared and the
  user is sent back to login.
- **Auto kick-out** on `401` (revoked or expired session) with a clear
  "session expired" notice; de-duplicated so a burst of failed requests logs
  out only once.
- **Logout** revokes the session server-side first, then clears local state.
- Backend session module (proposed in `backend/_proposed/`) adds a `jti`-keyed
  `auth_sessions` table for IP capture, last-login, last-activity and remote
  revocation, plus an `auth_events` audit log.

### 2. Home Dashboard

- Personalized greeting + avatar; tapping the avatar opens an account menu to
  **Update Details** or **switch Operation ⇄ Manager view**.
- Today's attendance card, leave & room quick stats, and a newsflash carousel.
- End-of-scroll footer showing **last sign-in time + client IP** (session detail).

### 3. Attendance

- Daily status card showing **scheduled vs actual** check-in/out with variance
  (early / late / on-time), worked hours, and an "in-progress" state when the
  logout hasn't been collected yet.
- Status descriptions sourced from the API (not hardcoded).
- Weekly / Monthly calendar overview with per-day selection.
- Insights: attendance rate, late trend, current streak, smart recommendation.
- **Operation vs Manager** view toggle (each loads a different dataset).

### 4. Leave Management

- Apply with leave type, period (full / half-day), date or range, reason,
  clinic (for medical types), supporting-document upload, and remarks.
- Field validation; duration auto-computed (0.5 for half-day, inclusive day
  count for full-day) and submitted on the correct `duration` field.
- View history with status filters and a detail sheet.
- **Withdraw / cancel** pending applications.
- Smooth flow: navigate / dismiss → toast → background store reload.

### 5. Newsflash

- Company announcements as a carousel and full list.
- Acknowledgement of newsflashes.

### 6. Room Booking

- Browse rooms with tower / level filters and images.
- Date picker (weekly / monthly) to check availability per day.
- Time-slot selection and booking with a purpose note.
- **My Reservations** with Active / History / Void tabs, a reservation-summary
  detail sheet, and cancellation.

### 7. Staff Profile & Settings

- View profile (name, designation, contact, address) and app preferences
  (dark mode), plus an About sheet with web & latest-development links.
- **Update profile**: nickname, email, contact number (digits-only), and
  address lines — with required-field + email/phone format validation; Save is
  disabled until the form is valid and changed.

### Shared / Overlay Components

Reusable feedback components used across all modules:

- Alert & Confirmation Dialogs
- Bottom Sheets
- Toast Notifications
- Fullscreen Loaders
- Modals

---

## Progressive Web App (PWA)

- Installable to the home screen via `public/manifest.json` (`standalone`
  display, theme/background colors).
- App icons: `192` & `512` standard, a padded `512` **maskable** (Android
  adaptive), a `180` **apple-touch-icon** (iOS), and a `favicon`.
- Offline app-shell caching via a service worker.
- Dynamic-viewport handling so the browser's URL/search bar doesn't leave a
  background band; the installed app runs full-screen.

---

## Backend Integration

The application communicates with the existing PHP backend through a centralized Context API architecture, providing:

- User authentication
- Data synchronization
- API state management
- Shared application state across modules

---

## Deployment

FAITH Mobile ships as a static web/PWA build served by nginx in a single Docker
container; nginx also proxies `/api` to the PHP backend.

```bash
cp .env.example .env
docker compose up --build   # → http://localhost:8080
```

Full local + Dokploy instructions and the environment variable reference are in
[`docs/deployment.md`](docs/deployment.md).

---

## Code Style

- TypeScript-first architecture
- Reusable component patterns
- Token-based design system
- Context-driven state management
- Scalable project structure
- Mobile-first UI implementation

---

## UI Philosophy

FAITH Mobile emphasizes:

- Clean enterprise experience
- Mobile-first interactions
- Consistent design language
- Efficient operational workflows
- Accessible navigation patterns
- Reusable design tokens and components

---

## License

Internal Project — FAITH Workspace Platform