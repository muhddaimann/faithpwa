# FAITH Mobile

FAITH is your all-in-one workspace solution for modern teams. This mobile application is a companion to our powerful web platform.
Built with Expo and React Native, FAITH Mobile helps employees stay connected, productive and organized anytime, anywhere.

---

## Features

- Authentication & User Session
- Room Booking Management
- Workspace Availability Tracking
- Staff Profile & Settings
- Interactive Overlay System
- Toasts, Modals & Page Sheets
- Dynamic Theme Support
- Responsive Mobile UI
- Scroll-Aware Navigation
- Design Token System

---

## Tech Stack

- React Native
- Expo
- TypeScript
- React Native Paper (MD3)
- Expo Router
- Context API

---

## Design System

FAITH Mobile uses a centralized design system powered by:

- `useTheme()` for semantic theming
- `useDesign()` for spacing, radius, typography, and layout tokens

This ensures:
- consistent UI
- scalable components
- dark/light theme support
- maintainable styling architecture

---

## Main Modules

### Workspace & Room Booking

- Room availability overview
- Dynamic room filtering
- Booking management
- Availability insights
- Interactive room listing

### Staff Settings

- Update profile information
- Contact & address management
- Personal settings
- Account preferences

### Overlay Components

- Alert Dialogs
- Confirmation Dialogs
- Bottom Sheets
- Fullscreen Loaders
- Toast Notifications
- Modal Components

---

## Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npx expo start
```

### Run Android

```bash
npx expo run:android
```

### Run iOS

```bash
npx expo run:ios
```

---

## Environment

Create a `.env` file:

```env
API_URL=
APP_ENV=
```

---

## Code Style

- TypeScript-first architecture
- Reusable component patterns
- Tokenized spacing & radius system
- Context-driven state management
- Minimal and scalable UI structure

---

## UI Philosophy

FAITH focuses on:
- clean enterprise UX
- mobile-first interactions
- soft modern surfaces
- compact operational layouts
- accessible navigation patterns

---

## License

Internal Project — FAITH Workspace Platform

faithpwa/
├─ .expo/
│  ├─ web/
│  │  └─ cache/
│  │     └─ production/
│  │        └─ images/
│  │           └─ favicon/
│  │              └─ favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent/
│  │                 └─ favicon-48.png
│  ├─ devices.json
│  └─ README.md
├─ app/
│  ├─ (tabs)/
│  │  ├─ home/
│  │  │  ├─ attendance/
│  │  │  │  └─ index.tsx
│  │  │  ├─ leave/
│  │  │  │  ├─ apply.tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ newsflash/
│  │  │  │  └─ index.tsx
│  │  │  ├─ room/
│  │  │  │  ├─ book.tsx
│  │  │  │  └─ index.tsx
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ main.tsx
│  │  ├─ settings/
│  │  │  ├─ _layout.tsx
│  │  │  ├─ index.tsx
│  │  │  └─ update.tsx
│  │  └─ _layout.tsx
│  ├─ _layout.tsx
│  └─ index.tsx
├─ assets/
│  ├─ img/
│  │  ├─ logo.png
│  │  └─ sublogo.png
│  ├─ android-icon-background.png
│  ├─ android-icon-foreground.png
│  ├─ android-icon-monochrome.png
│  ├─ favicon.png
│  ├─ icon.png
│  └─ splash-icon.png
├─ components/
│  ├─ attendance/
│  │  ├─ attendaceInsight.tsx
│  │  ├─ attendaceOverview.tsx
│  │  └─ attendanceCard.tsx
│  ├─ leave/
│  │  └─ leaveList.tsx
│  ├─ newsflash/
│  │  ├─ newsflashCarousel.tsx
│  │  └─ newsflashList.tsx
│  ├─ overlay/
│  │  ├─ alert.tsx
│  │  ├─ confirm.tsx
│  │  ├─ loader.tsx
│  │  ├─ modal.tsx
│  │  ├─ sheet.tsx
│  │  └─ toast.tsx
│  ├─ room/
│  │  ├─ roomBento.tsx
│  │  ├─ roomList.tsx
│  │  └─ roomTimeSheet.tsx
│  ├─ clinicModal.tsx
│  ├─ datePicker.tsx
│  ├─ documentModal.tsx
│  ├─ head.tsx
│  ├─ header.tsx
│  ├─ navBar.tsx
│  ├─ noData.tsx
│  ├─ pickerModal.tsx
│  ├─ rowtwo.tsx
│  ├─ scrollTop.tsx
│  ├─ section.tsx
│  └─ tail.tsx
├─ constants/
│  ├─ attendance.ts
│  ├─ design.ts
│  ├─ leave.ts
│  ├─ newsflash.ts
│  ├─ room.ts
│  └─ theme.ts
├─ contexts/
│  ├─ api/
│  │  ├─ api.tsx
│  │  ├─ attendance.tsx
│  │  ├─ attendanceStore.ts
│  │  ├─ auth.tsx
│  │  ├─ balance.tsx
│  │  ├─ broadcast.tsx
│  │  ├─ broadcastStore.ts
│  │  ├─ clinic.tsx
│  │  ├─ leave.tsx
│  │  ├─ leaveStore.ts
│  │  ├─ room.tsx
│  │  ├─ roomStore.ts
│  │  ├─ staff.tsx
│  │  └─ staffStore.ts
│  ├─ authContext.tsx
│  ├─ designContext.tsx
│  ├─ overlayContext.tsx
│  ├─ tabContext.tsx
│  ├─ themeContext.tsx
│  └─ tokenContext.tsx
├─ dist/
│  ├─ _expo/
├─ hooks/
├─ public/
│  └─ sw.js
├─ .env
├─ .gitignore
├─ app.json
├─ babel.config.js
├─ metro.config.js
├─ package-lock.json
├─ package.json
├─ readme.md
├─ tsconfig.json
└─ vercel.json
