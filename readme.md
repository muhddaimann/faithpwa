# Faith HRMS - Modern Employee Experience Platform

A comprehensive, gamified Human Resource Management System (HRMS) built with Expo and React Native. Designed to provide employees with a seamless, immersive, and rewarding work experience.

## 🚀 Features

### 🕒 Attendance Management
*   **Real-time Tracking:** Clock in, clock out, and manage break times with a live session timer.
*   **Detailed History:** Review past attendance records and total working hours.
*   **Shift Awareness:** View current shift details and scheduled hours.

### 📅 Leave Management
*   **Balance Overview:** Track remaining balances for Annual, Sick, and Casual leave at a glance.
*   **Quick Application:** Simple flow to submit leave requests with reason and dates.
*   **Status Tracking:** Monitor the progress of requests from Pending to Approved.

### 📢 Company Broadcasts
*   **Categorized Updates:** Stay informed with Policy, Urgent, Event, and General announcements.
*   **Acknowledgment System:** Formal confirmation for critical policy updates and security patches.
*   **Smart Feed:** Latest updates highlighted directly on the home dashboard.

### 🏢 Room Booking
*   **Space Management:** Browse available meeting rooms with capacity and facility details.
*   **Conflict Prevention:** Intelligent availability checking to prevent double-bookings.
*   **Facility Icons:** Quickly identify rooms with TV, AC, Video Conferencing, or Whiteboards.

### 💰 Expense Claims
*   **Digital Reimbursements:** Submit claims for Transport, Meals, Medical, and more.
*   **Financial Summary:** View pending totals and approved amounts for the current month.
*   **Attachment Ready:** Built-in structure for future receipt upload integration.

### 💵 Payroll & Performance
*   **Payslip Archive:** Access and download monthly net salary breakdowns.
*   **Appraisal System:** View performance reviews, manager comments, and star ratings.
*   **Compensation Overview:** High-level summary of latest earnings on the dashboard.

### 🏆 Gamification (Rewards)
*   **XP & Leveling:** Earn experience points for standard tasks like on-time check-ins.
*   **Achievements:** Unlock badges like "Early Bird," "Road Warrior," and "Policy Guru."
*   **Leaderboard:** Friendly competition with colleagues to foster engagement.

## 🛠 Tech Stack & Architecture

*   **Framework:** Expo (SDK 55) / React Native
*   **UI Library:** React Native Paper (Material Design 3)
*   **Navigation:** Expo Router (Stack & Tab navigation)
*   **State Management:** Context API (Modular provider architecture)
*   **Design System:** Token-based design for consistent spacing, radii, and typography.

## ⚙️ Core Systems

### Unified Refresh System
A centralized `RefreshContext` allows all seven modules to synchronize their data simultaneously via a global **Pull-to-Refresh** gesture on the Home screen.

### Developer Debug Suite
A built-in **Mock Data Toggle** (database icon in header) that instantly switches the entire application between a populated "Busy" state and a fresh "New User" experience across all modules.

### Centralized Quick Actions
The custom-built `PickerModal` in the navigation bar provides a single hub for primary actions (Clock In, Apply Leave, Book Room) accessible from any screen.

## 📁 Directory Structure
*   `app/` - File-based routing and page layouts.
*   `components/` - Atomic and module-specific UI components.
*   `contexts/` - Business logic and data management for each module.
*   `constants/` - Design tokens and theme configurations.

---
*Built with ❤️ for a better workplace experience.*
