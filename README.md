# Mini Quiz — Next.js App

A small quiz game built with Next.js App Router, React 19, and Tailwind CSS 4. The UI renders client-side and talks to API routes that proxy an upstream quiz service.

## Quick Start

- **Install**

  ```bash
  npm install
  ```

- **Develop**

  ```bash
  npm run dev
  ```

  Then open http://localhost:3000

- **Build**

  ```bash
  npm run build
  ```

- **Start (production)**

  ```bash
  npm start
  ```

## Architecture Notes

- **Framework**

  - Next.js `16.0.7` with the **App Router** (`/app` directory).
  - React `19.2.0` and React DOM `19.2.0`.

- **Routing**

  - Pages live under `/app` (e.g., `app/page.tsx`).
  - API routes live under `/app/api/*/route.ts` and proxy an upstream Cloudflare Worker endpoint.

- **Runtime: Node vs Edge**

  - No explicit `export const runtime = 'edge'` is set in API routes, so they run on the **Node.js runtime** by default.
  - If Edge is desired, add `export const runtime = 'edge'` to individual route handlers and ensure upstream usage is compatible.

- **Rendering model**

  - `app/page.tsx` is a client component (`"use client"`), so the quiz UI is **client-rendered**.
  - Data is fetched client-side from `/api/quiz`, which in turn proxies the upstream service.

## Validation Approach

- **Client-side checks only**

  - The UI prevents navigation until all visible questions are answered.
  - Answers are posted to `/api/grade` per question group.

- **Server-side**

  - API routes (`/api/quiz`, `/api/grade`) act as thin proxies and do not perform schema validation on request/response bodies.

- **Future hardening (recommended)**

  - Add runtime validation (e.g., `zod`) for incoming/outgoing JSON in API routes.
  - Handle upstream errors and shape mismatches explicitly with typed guards.

## Libraries Used and Rationale

- **next**: Core framework for routing, API routes, and build tooling.
- **react / react-dom**: UI runtime.
- **tailwindcss (v4)** + **@tailwindcss/postcss**: Utility-first styling and PostCSS integration.
- **clsx**, **tailwind-merge**: Class composition utilities to avoid conflicting Tailwind classes.
- **class-variance-authority**: Patterning variant-based component APIs.
- **@radix-ui/react-label** and **@radix-ui/react-slot**: Accessible primitives for form/UI composition.
- **lucide-react**: Icon set.
- **aos**: Simple scroll animations.
- **motion**: Animation library for interactive elements.
- **react-timer-hook**: Timer utilities used by the quiz countdown wrapper (`MyTimer`).
- **radix-ui**: Broader Radix components (present; only primitives are used currently).
- **hono**: Included dependency

## Trade-offs and Shortcuts

- **Proxy-only API**

  - API routes are thin proxies to a Cloudflare Worker (`WORKER_URL` hardcoded). This simplifies the app but couples it to the upstream shape and availability.

- **No schema validation**

  - Faster development, but risks runtime errors if upstream changes. Consider `zod` for both requests and responses.

- **Node runtime (not Edge)**

  - Default Node runtime keeps compatibility broad. If ultra-low latency is needed, opt-in to Edge per route.

- **Client-side rendering for quiz page**

  - Simpler stateful UI and animations. Trades off initial SSR for interactivity-first UX.

## Scripts

- **dev**: `next dev`
- **build**: `next build`
- **start**: `next start`
- **lint**: `eslint`

### Honest time spent

- **Planing**: 1 hour
- **Learning**: 3 hours
- **Development**: 10 hours
- **Deployment**: 5 minutes
- **Total**: 14hr 5 minutes
