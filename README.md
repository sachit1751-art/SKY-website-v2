# 📱 SKY — Official Device & Custom ROM Community Hub

<div align="center">

> **SKY — Built for everyone.**  
> *A community-driven Android hub and custom ROM ecosystem built to be different.*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Motion](https://img.shields.io/badge/Motion-12.23-FF4154?style=flat-square&logo=framer&logoColor=white)](https://motion.dev/)

[**Explore Live Website**](https://sky-roms.vercel.app/) • [**Report an Issue**](#contributing) • [**Flashing Guide**](#-interactive-flashing-companion) • [**Admin Suite**](#-administrative-portal)

</div>

---

## 📖 Overview

The **SKY Community Web Platform** is a fast, modern, and content-centric portal dedicated to custom ROM enthusiasts, developers, and device maintainers for the **SKY** Android device ecosystem (Redmi 12 5G / POCO M6 Pro 5G / sky). 

Inspired by clean, minimalist Android design systems (PixelOS / Material You), the platform offers a seamless experience for browsing verified ROM builds, following step-by-step flashing guides, engaging with community feedback, and managing releases through an administrative portal.

---

## ✨ Key Features

### 📱 ROM Catalog & Device Showcase
- **Curated ROM Directory**: Browse official and community builds (AOSP, PixelOS, LineageOS, Evolution X, RisingOS, crDroid, and more) with real-time Android version tags, build dates, maintainers, and security patch levels.
- **Fuzzy Search & Fast Filtering**: Instant search powered by `Fuse.js` with multi-criteria filters (Android 14/15, Official/Unofficial, GApps/Vanilla status).
- **Virtual Scrolling**: Optimized rendering for extensive lists via `@tanstack/react-virtual`.
- **Comprehensive ROM Overviews**: Detailed modals featuring changelogs, installation prerequisites, screenshots, MD5 checksum verification, and fast mirror links.

### ⚡ Interactive Flashing Companion
- **Step-by-Step Interactive Checklist**: Real-time progress tracker with checkbox completion states that persist across browser sessions via `localStorage`.
- **Multi-Method Guides**: Dedicated tabs for **Clean Flash**, **Dirty Flash (OTA)**, **Firmware Flashing**, and **Interactive Checklist**.
- **Progress Gauge & Reset**: Live visual completion bar and one-click reset button for safe recovery during flash sessions.

### 💬 Community & Feedback Hub
- **Feedback & Bug Tracker**: Submit bug reports, feature requests, and general inquiries with device/ROM tag associations.
- **Community Upvoting**: Users can upvote community suggestions and trending issues.
- **Pinned Announcements & Highlights**: Admin-pinned posts with distinct badges prioritized at the top of the feed.

### 🛡️ Administrative Portal
- **Role-Based Access Control**: Secure token authentication with admin and super-admin privilege tiers.
- **ROM Management (CRUD)**: Create, update, toggle active status, and archive ROM listings with changelog formatting.
- **Feedback Moderation Suite**: Review feedback, update statuses (*Pending*, *In Progress*, *Resolved*, *Dismissed*), compose official responses, toggle pinned status, or delete spam.
- **Security & Audit Logs**: Detailed timeline of administrator actions, logins, and permission changes.
- **One-Click System Backup & Export**: Instant administrative export of full system data (ROMs, maintainers, feedbacks, audit logs) as formatted JSON via `/api/admin/backup`.

### 🎨 Design & Experience
- **Adaptive Light & Dark Modes**: Carefully calibrated warm-neutral and deep obsidian themes passing WCAG AA contrast standards.
- **Fluid Layout & Micro-Interactions**: Smooth spring animations, layout transitions, and icon interactions powered by `motion`.
- **Multilingual Support (i18n)**: Internationalization configured with `i18next` for global community members.
- **Unified Toast Feedback**: Consistent notifications across both user actions and administrative operations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript 5.8, React Router v7 |
| **Styling & Theme** | Tailwind CSS v4, Lucide React Icons |
| **Animations** | Motion (Framer Motion v12) |
| **State & Search** | React Hooks, Context API, Fuse.js, TanStack Virtual |
| **Internationalization** | i18next, react-i18next |
| **Backend & API** | Node.js, Express 4.21, TypeScript (via `tsx`) |
| **Build & Bundler** | Vite 6.2, esbuild |
| **Data & Storage** | In-memory store with Supabase integration support & JSON backup exporter |

---

## 📁 Project Structure

```text
.
├── api/                    # Express API router & backend controllers
│   └── index.ts            # REST endpoints (ROMs, auth, feedback, backup)
├── public/                 # Static assets, logos, and maintainer avatars
│   ├── admins/             # Maintainer profiles
│   └── roms/               # ROM banner graphics and screenshots
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin portal components (FeedbackManager, RomEditor, etc.)
│   │   ├── icons/          # Animated vector icon wrappers
│   │   ├── FeedbackModal.tsx # Public community feedback dialog
│   │   ├── FlashingGuide.tsx # Flashing guide with interactive checklist
│   │   ├── Navbar.tsx      # Global navigation header
│   │   ├── RomCard.tsx     # Grid & list item ROM cards
│   │   ├── RomDetailsModal.tsx # Full ROM details, mirrors & guide modal
│   │   └── Toast.tsx       # Global toast notification container
│   ├── context/            # ToastContext, AuthContext, ThemeContext
│   ├── pages/              # Primary route views (Home, Catalog, Community, Admin)
│   ├── types/              # Global TypeScript interfaces & schemas
│   ├── App.tsx             # Root routing and provider hierarchy
│   ├── index.css           # Tailwind CSS v4 entrypoint
│   └── main.tsx            # React application entrypoint
├── metadata.json           # Application metadata & permissions
├── package.json            # Scripts & project dependencies
├── server.ts               # Express server entry point & Vite middleware
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build & plugin configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/sky-roms.git
   cd sky-roms
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy the example environment file if you plan to connect external services:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware on port 3000 with hot-reload. |
| `npm run build` | Builds the client application for production and bundles `server.ts` into `dist/server.cjs`. |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`). |
| `npm run lint` | Runs the TypeScript compiler check (`tsc --noEmit`) to validate type safety. |
| `npm run clean` | Cleans up the `dist/` build output and temporary bundle artifacts. |

---

## 🔌 API Endpoints Reference

### Public Endpoints
- `GET /api/roms` — List all available custom ROMs with maintainer details and mirror links.
- `GET /api/roms/:id` — Retrieve comprehensive details for a specific ROM.
- `GET /api/feedback/public` — List public community feedback (pinned items prioritized).
- `POST /api/feedback` — Submit a new community feedback or bug report.
- `POST /api/feedback/:id/upvote` — Upvote a feedback submission.

### Admin Endpoints (Protected)
- `POST /api/admin/login` — Authenticate admin credentials and receive session token.
- `POST /api/admin/roms` — Create a new ROM entry.
- `PUT /api/admin/roms/:id` — Update existing ROM configuration and build links.
- `DELETE /api/admin/roms/:id` — Remove or archive a ROM entry.
- `PATCH /api/admin/feedback/:id` — Update feedback status, add admin response, or toggle pinned state.
- `DELETE /api/admin/feedback/:id` — Permanently remove a feedback submission.
- `GET /api/admin/backup` — Download full formatted JSON snapshot of all system collections.

---

## 🤝 Contributing

Contributions to the SKY web platform are always welcome!

1. **Fork the Repository**
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

Please ensure all tests and type checks pass with `npm run lint` and `npm run build` before opening a pull request.

---

## 👥 Community & Credits

- **SKY Project Core Team**: Maintainers, designers, and open-source contributors.
- **Custom ROM Maintainers**: Thank you to all developers building AOSP, PixelOS, LineageOS, Evolution X, and other distributions for the community.

---

<div align="center">

**SKY — Built for everyone.**

</div>

