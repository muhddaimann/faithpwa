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

## Project Structure

```bash
app/
components/
constants/
contexts/
hooks/
services/
utils/
```

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