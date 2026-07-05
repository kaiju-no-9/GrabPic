# GrabPic — UX Implementation Plan

> **GrabPic** is an event photo sharing platform where organisers upload photos, and attendees find their own photos via AI-powered face recognition.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Architecture Summary](#2-architecture-summary)
3. [Data Model](#3-data-model)
4. [Complete API Reference](#4-complete-api-reference)
5. [Current Frontend Routes & Components](#5-current-frontend-routes--components)
6. [User Flows](#6-user-flows)
7. [UX Problems in Current Implementation](#7-ux-problems-in-current-implementation)
8. [Proposed UX Redesign](#8-proposed-ux-redesign)
9. [Page-by-Page Specifications](#9-page-by-page-specifications)
10. [Design System](#10-design-system)
11. [Implementation Phases](#11-implementation-phases)

> **Note**: The landing page (`/`) is built and maintained separately. This plan covers the **app UI** starting from signin/signup through dashboard and event pages.

---

## 1. Product Overview

### What it does
- **Organisers** create events, upload bulk photos (to Cloudinary), and the AI service automatically detects faces and generates 512-dimensional embeddings stored in pgvector.
- **Attendees** join events via a 6-character code, upload a selfie, and the system performs cosine similarity search to find all photos containing their face.
- Matched photos can be downloaded as a ZIP archive.

### Core Value Proposition
> "Find your face in the crowd" — attend an event, scan your face, and instantly get every photo you appear in.

---

## 2. Architecture Summary

```
┌───────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend    │────▶│   Backend API    │────▶│   AI Service     │
│  Next.js 16   │     │  Express + Prisma│     │  FastAPI + ONNX  │
│  localhost:3000│     │  localhost:5000   │     │  localhost:8000   │
└───────────────┘     └────────┬─────────┘     └────────┬─────────┘
                               │                        │
                    ┌──────────┴──────────┐    ┌───────┴────────┐
                    │                     │    │                │
               ┌────▼────┐         ┌─────▼───┐│  InsightFace   │
               │PostgreSQL│         │  Redis  ││  buffalo_l     │
               │+pgvector │         │ Streams ││  (CPU)         │
               └──────────┘         └─────────┘└────────────────┘
```

| Service | Port | Tech |
|---------|------|------|
| Frontend | 3000 | Next.js 16, Tailwind CSS 4, React 19 |
| Backend API | 5000 | Express, Prisma, Cloudinary SDK |
| AI Service | 8000 | FastAPI, InsightFace, asyncpg, pgvector |
| PostgreSQL | 5432 | pgvector/pgvector:pg16 |
| Redis | 6379 | redis:7-alpine (Streams for async processing) |

### Key Integration Flows
- **Photo Upload**: Frontend → Cloudinary (direct signed upload) → Backend confirms → Redis Stream → AI Worker processes embeddings
- **Face Search**: Frontend → Backend → AI Service (cosine similarity in pgvector) → matched photo IDs → Backend fetches Photo records
- **Auth**: OAuth2 (Google/GitHub) → JWT cookie (7 day expiry) → Redis-backed JWT blacklist for logout

---

## 3. Data Model

### Prisma Schema (PostgreSQL)

| Model | Key Fields | Relationships |
|-------|-----------|---------------|
| **User** | `id`, `name`, `email` | → Account[], Event[], EventMember[], Photo[] |
| **Account** | `provider`, `providerAccountId`, `accessToken`, `refreshToken` | → User |
| **Event** | `id`, `title`, `description`, `code` (unique, 6-char) | → User (creator), EventMember[], Photo[] |
| **EventMember** | `eventId`, `userId`, `role` (OWNER/MEMBER) | → Event, User. Unique on (eventId, userId) |
| **Photo** | `id`, `eventId`, `url`, `publicId`, `width`, `height` | → Event, User (uploader) |

### face_embeddings (raw SQL table, managed by AI service)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | primary key |
| `photo_id` | TEXT | FK to Photo.id |
| `event_id` | TEXT | FK to Event.id |
| `user_id` | TEXT | nullable |
| `embedding` | vector(512) | InsightFace normed embedding |
| `created_at` | TIMESTAMPTZ | auto |

---

## 4. Complete API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/google` | Redirects to Google OAuth consent | No |
| GET | `/auth/google/callback` | Exchanges code → JWT cookie → redirect `/dashboard` | No |
| GET | `/auth/github` | Redirects to GitHub OAuth | No |
| GET | `/auth/github/callback` | Exchanges code → JWT cookie → redirect `/dashboard` | No |

### User Routes (`/api/user`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user/me` | Returns `{ id, name, email }` | Yes |
| POST | `/user/logout` | Blacklists JWT in Redis, clears cookie | Yes |

### Event Routes (`/api/events`)
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/events` | Create event (title, description?) → generates 6-char code | Yes | — |
| GET | `/events` | List all events user is a member of | Yes | — |
| POST | `/events/join` | Join event by code | Yes | — |
| GET | `/events/:eventId` | Get event detail + photo count + first 20 photos | Yes | Member |
| DELETE | `/events/:eventId` | Delete event + cascade photos/embeddings + Cloudinary cleanup | Yes | Owner |
| POST | `/events/:eventId/leave` | Remove self from event | Yes | Member (not Owner) |
| GET | `/events/:eventId/photos?cursor=` | Paginated photos (20 per page, cursor-based) | Yes | Member |
| GET | `/events/:eventId/signed-url` | Get Cloudinary signed upload params | Yes | Member |
| POST | `/events/:eventId/photos/confirm` | Bulk save photo records → queue AI processing via Redis | Yes | Owner |
| POST | `/events/:eventId/photos/search-face` | Upload selfie → AI face search → return matched photos | Yes | Member |
| POST | `/events/:eventId/download` | Download selected photos as ZIP (streams archiver) | Yes | Member |

### AI Service Routes (`localhost:8000`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/process-photos` | Process photo list → extract embeddings → store in pgvector |
| POST | `/search-face?eventId=` | Binary image body → extract embedding → cosine similarity search |

---

## 5. Current Frontend Routes & Components

### Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `page.tsx` | Landing page — "Find your face in the crowd" + CTA buttons |
| `/signin` | `(auth)/signin/page.tsx` | Google + GitHub OAuth buttons |
| `/signup` | `(auth)/signup/page.tsx` | Same OAuth buttons, different copy |
| `/dashboard` | `dashboard/page.tsx` → `content.tsx` | Event list + Create/Join dialogs |
| `/events/[eventId]` | `events/[eventId]/page.tsx` | Event detail — photo grid + upload + face scan |

### Components
| Component | Purpose |
|-----------|---------|
| `Navbar` | Sticky top nav — context-aware (logged out vs dashboard vs event) |
| `EventCard` | Card in dashboard list — title, description, photo count, code |
| `CreateEventDialog` | Modal — title + description inputs |
| `JoinEventDialog` | Modal — 6-char code input |
| `UploadPhotosModal` | Multi-step: select files → upload to Cloudinary → confirm in backend |
| `ScanFaceModal` | Upload selfie → face search → triggers highlight on matched photos |
| `GoogleButton` / `GithubButton` | OAuth redirect buttons |

### UI Primitives (custom, not shadcn)
`Button`, `Card`, `Dialog`, `Input`, `Label`

---

## 6. User Flows

### Flow 1: Event Organiser
```
Landing → Sign Up (OAuth) → Dashboard → Create Event → Event Page
  → Upload Photos (Cloudinary) → Confirm → AI processes faces
  → Share 6-char code with attendees
  → (Optional) Delete event
```

### Flow 2: Event Attendee
```
Landing → Sign In (OAuth) → Dashboard → Join Event (enter code) → Event Page
  → "Find My Photos" → Upload selfie → AI matches face
  → See highlighted matched photos → Download as ZIP
  → (Optional) Leave event
```

### Flow 3: Face Search Detail
```
Event Page → Click "Find My Photos" / "Scan Face"
  → ScanFaceModal opens → Upload selfie (file picker)
  → POST /events/:id/photos/search-face (multipart)
  → Backend forwards binary to AI service
  → AI extracts embedding → pgvector cosine search (threshold 0.3)
  → Returns matched photo IDs → Backend fetches Photo records
  → Frontend highlights matched photos with green border + "Match" badge
```

---

## 7. UX Problems in Current Implementation

### 🔴 Critical
1. **No visual design system** — Entire UI is bare zinc-50 backgrounds with minimal styling. Looks like a wireframe, not a product.
2. **No loading/progress feedback during photo upload** — Upload to Cloudinary happens sequentially with no per-file progress bar.
3. **No photo lightbox/viewer** — Photos are just thumbnail grid items with no way to view full-size.
4. **No success/error toast notifications** — Operations fail silently or use raw `alert()`.
5. **No mobile-optimised navigation** — No hamburger menu, no bottom navigation for mobile.

### 🟡 Important
6. **No download UX for face-matched photos** — Users can see matched photos (green border) but no clear CTA to download just those.
7. **Landing page is content-sparse** — No feature explanation, no hero imagery, no social proof.
8. **Signin and Signup pages are identical functionally** — Both just show OAuth buttons. Wasteful separation.
9. **No event sharing UX** — Code is shown in a small monospace span. No share sheet, no QR code, no deep link.
10. **Navbar overloaded with inline SVG icons** — Hard to maintain, inconsistent sizing.

### 🟢 Nice-to-have
11. **No dark mode** — `globals.css` only has light mode despite having dark mode CSS vars.
12. **No skeleton loading states** — Dashboard has basic pulse skeletons but event page just shows "Loading..." text.
13. **No animation/transitions** — Page changes are jarring with no transition effects.
14. **No empty state illustrations** — Plain text for "no photos" and "no events".
15. **Photo grid not masonry** — Fixed aspect-square crops photos, loses composition context.

---

## 8. Proposed UX Redesign

### Design Philosophy
- **Dark-first theme** with vibrant accent gradients (purple → blue → teal)
- **Glassmorphism** for cards and modals (frosted glass + subtle borders)
- **Micro-animations** on every interaction (hover, click, transitions)
- **Mobile-first** responsive layout with bottom sheet navigation on mobile
- **Premium feel** — rounded corners, smooth shadows, typography hierarchy

### Color Palette
```
Background:     #0A0A0F (deep dark)
Surface:        #14141F (card backgrounds)
Surface-hover:  #1C1C2E
Border:         rgba(255,255,255,0.06)
Border-hover:   rgba(255,255,255,0.12)
Text-primary:   #FAFAFA
Text-secondary: #A1A1AA
Text-muted:     #6B6B80
Accent:         linear-gradient(135deg, #7C3AED, #3B82F6, #06B6D4)
Success:        #22C55E
Error:          #EF4444
Warning:        #F59E0B
```

### Typography
- **Font**: Inter (Google Fonts) — clean, modern, excellent readability
- **Heading scale**: 48px / 36px / 28px / 22px / 18px
- **Body**: 16px / 14px / 12px
- **Monospace** (event codes): JetBrains Mono

---

## 9. Page-by-Page Specifications

> **Landing page (`/`) is out of scope** — it is built and maintained in a separate project. The app UI begins at signin/signup.

### 9.1 Auth Pages (`/signin`, `/signup`) — Entry Point
**Goal**: Fast, frictionless OAuth entry. This is the first screen users see when entering the app.

**Layout**:
- Split screen layout (desktop): left half — branding panel with GrabPic logo, tagline "Find your face in the crowd", and subtle animated gradient background; right half — auth card
- Single column (mobile): logo + tagline at top, auth card below
- Auth card with glassmorphism effect (frosted glass, subtle border)
- Google and GitHub OAuth buttons with provider icons and branded colors
- Toggle link between sign in / sign up at bottom
- Privacy note: "Your photos are processed securely and not stored permanently"

**Interactions**:
- Card entrance animation (scale up + fade in)
- Button hover: subtle lift + glow effect
- Loading spinner on button when OAuth redirect is pending
- Background gradient animation (slow color shift)

---

### 9.2 Dashboard (`/dashboard`)
**Goal**: Quick access to all events, easy event management

**Layout**:
- Sidebar nav (desktop) / Bottom nav (mobile)
  - Home/Events, Create Event, Join Event, Profile/Settings
- Main area:
  - Welcome header: "Welcome back, {name}" + user avatar initials
  - Search/filter bar for events
  - Event grid (2-col desktop, 1-col mobile)
  - Each event card shows: title, description preview, photo count, member role badge (Owner/Member), event code

**Event Card Design**:
- Glassmorphism card with subtle border
- Left: gradient avatar/icon based on event title
- Center: title, description, stats
- Right: arrow indicator + role badge
- Hover: lift + border glow

**Empty State**:
- Illustration (camera icon with sparkles)
- "No events yet" + two CTAs: Create / Join

---

### 9.3 Event Detail (`/events/[eventId]`)
**Goal**: Browse, search, and download event photos

**Layout**:
- Sticky header: Event title, description, photo count, event code (copy button)
- Action bar: "Upload Photos" (Owner only), "Find My Photos", "Download Selected", share button
- Photo grid: Masonry layout or 3-column grid with aspect-ratio preservation
- Matched photos section: When face search returns results, show a separate "Your Photos" section at the top with highlighted cards
- Infinite scroll pagination (replace "Load More" button)

**Photo Card**:
- Rounded corners, subtle shadow
- Hover: scale up slightly, show overlay with download icon
- Click: Opens lightbox with full-size image, left/right navigation
- Matched: Green gradient border + floating "Match" badge

**Face Scan Flow** (redesigned):
1. Click "Find My Photos"
2. Full-screen modal with camera icon
3. Option: "Take a Selfie" (open camera) or "Upload Photo"
4. Preview circle with face detection indicator
5. "Searching..." state with pulsing animation
6. Results: "Found X photos!" with confetti animation → auto-scroll to matched section

**Upload Flow** (redesigned, Owner only):
1. Click "Upload Photos"
2. Drag-and-drop zone (full width)
3. File thumbnails appear with individual progress bars
4. Concurrent uploads with overall progress
5. "Confirm Upload" → success toast → "AI is processing faces..."
6. Processing status indicator until embeddings are generated

**Share Event**:
- Click share icon → bottom sheet / popover
- QR code generated from event join URL
- Copy code button
- Share via link button (Web Share API)

---

### 9.4 Photo Lightbox (New Component)
**Goal**: Full-size photo viewing with navigation

**Layout**:
- Full-screen overlay with dark backdrop
- Centered image with aspect-ratio preservation
- Left/right arrow navigation (keyboard support)
- Top-right: close, download single photo
- Bottom: thumbnail strip for quick navigation
- Swipe gesture support on mobile

---

### 9.5 Download Flow
**Goal**: Let users download matched photos easily

**Current**: Hidden `downloadPhotos()` function exists but no UI triggers it for matched photos specifically.

**Proposed**:
- After face scan → "Download All X Matched Photos" button appears
- Individual download button on each photo in lightbox
- Select multiple photos → floating "Download X Photos" FAB
- Download triggers ZIP creation via backend

---

## 10. Design System

### Components to Build/Redesign

| Component | Priority | Notes |
|-----------|----------|-------|
| **Button** | P0 | Variants: primary (gradient), secondary (outline), ghost, destructive, icon |
| **Card** | P0 | Glassmorphism with hover animation |
| **Dialog/Modal** | P0 | Centered with backdrop blur, entrance animation |
| **Input** | P0 | Dark-themed with focus ring glow |
| **Toast/Notification** | P0 | Slide-in from top-right, auto-dismiss |
| **Navbar** | P0 | Responsive: sidebar desktop, bottom bar mobile |
| **PhotoGrid** | P0 | Masonry or responsive grid with lazy loading |
| **PhotoLightbox** | P1 | Full-screen viewer with navigation |
| **DropZone** | P1 | Drag-and-drop file upload area |
| **ProgressBar** | P1 | Linear and circular variants |
| **Badge** | P1 | Role badges, match indicators |
| **Avatar** | P1 | Initials fallback, gradient backgrounds |
| **EmptyState** | P2 | Illustration + text + CTA pattern |
| **Skeleton** | P2 | Pulse loading placeholders |
| **QRCode** | P2 | For event sharing |

### Animation Library
Use CSS animations + `@keyframes` for most interactions. Consider Framer Motion only if complex orchestrated animations are needed.

---

## 11. Implementation Phases

> Landing page is out of scope (built separately). Work starts from signin/signup.

### Phase 1 — Design System & Signin/Signup (Start Here)
- [ ] Define CSS custom properties (colors, spacing, typography, shadows)
- [ ] Build/redesign all primitive components (Button, Input, Card, Dialog, Toast)
- [ ] Set up Inter + JetBrains Mono fonts
- [ ] Add dark mode as default theme
- [ ] Create reusable animation keyframes (fadeIn, slideUp, scaleIn, shimmer)
- [ ] Redesign signin/signup with split-screen layout + glassmorphism card
- [ ] Add loading states to OAuth buttons
- [ ] Add animated gradient background for auth pages

### Phase 2 — Dashboard
- [ ] Responsive layout with sidebar/bottom nav
- [ ] Redesign event cards with glassmorphism + hover effects
- [ ] Redesign create/join event modals
- [ ] Add empty states with illustrations
- [ ] Add search/filter for events
- [ ] Add toast notifications for create/join success/error

### Phase 3 — Event Detail Page
- [ ] Redesign photo grid (responsive, aspect-ratio preservation)
- [ ] Add photo lightbox component
- [ ] Redesign face scan modal with improved UX flow
- [ ] Redesign upload photos modal with drag-drop + progress
- [ ] Add event sharing (QR code + copy link + Web Share API)
- [ ] Add "Download Matched Photos" button after face scan
- [ ] Add infinite scroll for photo pagination
- [ ] Add skeleton loading for photo grid
- [ ] Toast notifications for all operations

### Phase 4 — Polish & Mobile
- [ ] Full mobile responsiveness audit
- [ ] Touch gesture support (swipe in lightbox)
- [ ] Performance optimisation (image lazy loading, virtual scrolling for large galleries)
- [ ] Accessibility audit (keyboard navigation, ARIA labels, focus management)
- [ ] SEO: meta tags, Open Graph for event sharing
- [ ] Error boundaries and graceful degradation

---

## File Structure Reference

```
apps/
├── web/                          # Next.js 16 frontend
│   ├── api/                      # API client functions
│   │   ├── auth.ts               # axios instance + getMe, logout
│   │   └── events.ts             # All event/photo API functions
│   ├── app/
│   │   ├── (auth)/signin/        # OAuth sign-in page
│   │   ├── (auth)/signup/        # OAuth sign-up page
│   │   ├── dashboard/            # Event list dashboard
│   │   ├── events/[eventId]/     # Event detail + photo grid
│   │   ├── layout.tsx            # Root layout + AuthProvider
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── ui/                   # Button, Card, Dialog, Input, Label
│   │   ├── navbar.tsx
│   │   ├── event-card.tsx
│   │   ├── create-event-dialog.tsx
│   │   ├── join-event-dialog.tsx
│   │   ├── upload-photos-modal.tsx
│   │   ├── scan-face-modal.tsx
│   │   ├── google-button.tsx
│   │   └── github-button.tsx
│   └── lib/
│       ├── auth-context.tsx      # React context for auth state
│       └── utils.ts              # cn() utility
│
├── backend/                      # Express API
│   └── src/
│       ├── modules/
│       │   ├── auth/             # Google/GitHub OAuth controllers
│       │   ├── events/           # All event + photo CRUD
│       │   └── user/             # getMe + logout
│       ├── middlewares/          # auth, rate-limiter, multer, error handler
│       ├── config/               # env, cloudinary, redis, logger
│       └── utils/                # ApiResponse, ApiError, asyncHandler
│
├── ai-service/                   # Python FastAPI
│   └── src/
│       ├── main.py               # /health, /process-photos, /search-face
│       ├── services/
│       │   ├── face_service.py   # InsightFace model, embedding extraction
│       │   └── vector_store.py   # pgvector operations
│       └── worker/
│           └── worker.py         # Redis stream consumer + retry + dead letter
│
packages/
└── db/
    └── prisma/
        └── schema.prisma         # User, Account, Event, EventMember, Photo
```
