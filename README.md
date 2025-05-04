# 🧩 MangaDex Reader Monorepo

A high-performance fullstack manga reader, powered by **Fastify**, **Next.js 14**, and **TurboRepo**. This monorepo hosts both the backend API and frontend web application — designed for speed, scalability, and a polished reading experience.

---

## 🖼️ Preview

| Home | Reader |
|------|--------|
| ![Home](./assets/homepage.png) | ![Reader](./assets/reader.gif) |

--- 

## 🔥 Tech Stack

### 🛠 Backend (Fastify)
- **Fastify 4.x** — High-performance API framework
- **Sharp** — Efficient image processing and streaming
- **Prisma** — PostgreSQL ORM
- **TypeScript** — Strict typing and DX
- **PM2** — Production process manager

### 💅 Frontend (Next.js 14)
- **App Router** & React Server Components
- **Dexie.js** — Chapter caching via IndexedDB
- **Tailwind CSS** — Utility-first styling
- **Axios** — API requests with interceptors
- **React Query** — Data fetching and caching

### 🧩 Monorepo Tooling
- **TurboRepo** — Incremental builds and caching
- **PNPM Workspaces** — Efficient dependency management

---

## ✨ Key Features

### 🖼️ Optimized Manga Streaming
- Images downloaded in parallel with adaptive batching (based on CPU cores)
- Resized and merged using **Sharp**
- MangaDex chapter pages streamed and processed on-demand

### ⚙️ Smart Backend
- Secure `.env`-based config
- Well-structured **services** and **controllers**
- Proxy-ready MangaDex integration
- Ready for token refresh, multi-user support, etc.

### 💡 Frontend Experience
- Modern Next.js App Router setup
- High/low image quality toggle
- Keyboard navigation
- IndexedDB caching with TTL cleanup

---

## 📚 API Endpoints

| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| POST   | `/login`                          | Login with MangaDex credentials |
| POST   | `/refreshToken`                   | Refresh access token            |
| GET    | `/manga`                          | Fetch list of manga             |
| POST   | `/manga`                          | Search manga by query           |
| GET    | `/manga/:id`                      | Get manga details               |
| GET    | `/manga/:id/chapters`             | Get chapter list                |
| GET    | `/chapters/:id`                   | Chapter metadata                |
| GET    | `/chapters/:id/pages`             | Stream page-by-page images      |
| GET    | `/chapters/:id/download`          | Download vertical strip image   |
| GET    | `/popular` / `/latest`            | Curated endpoints               |

---

## 📁 Project Structure

