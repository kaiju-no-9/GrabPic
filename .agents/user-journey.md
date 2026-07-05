# GrabPic — User Journey & Application Flow

> How users interact with GrabPic from first visit to downloading their photos.

---

## Two Types of Users

| Role | Who | What they do |
|------|-----|-------------|
| **Organiser** | Event photographer, host, coordinator | Creates events, uploads bulk photos, shares event code |
| **Attendee** | Event guest, participant | Joins event with code, scans face, downloads their photos |

---

## 1. Authentication (Entry Point)

Both user types start here. There is no traditional email/password — **OAuth only**.

```
User arrives at /signin or /signup
        │
        ├── Click "Continue with Google"
        │       → Redirects to Google OAuth consent screen
        │       → Google returns auth code
        │       → Backend exchanges code for tokens
        │       → Creates/finds user in database
        │       → Sets JWT cookie (7-day expiry)
        │       → Redirects to /dashboard
        │
        └── Click "Continue with GitHub"
                → Same flow via GitHub OAuth
                → Redirects to /dashboard
```

**What the user sees:**
- Split-screen page: branding on left, auth card on right
- Two buttons: Google and GitHub
- Loading spinner while OAuth completes
- Auto-redirect to dashboard on success

---

## 2. Dashboard — Event Hub

After login, the user lands on `/dashboard`. This is the central hub.

```
┌─────────────────────────────────────────┐
│  Dashboard                              │
│                                         │
│  Welcome back, {name}                   │
│                                         │
│  [Create Event]  [Join Event]           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🎉 Company Offsite 2026        │    │
│  │ 142 photos · You're the owner  │    │
│  │ Code: A3X9K2                   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ 🎓 Graduation Party            │    │
│  │ 89 photos · Member             │    │
│  │ Code: B7F2M1                   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Sign Out]                             │
└─────────────────────────────────────────┘
```

**What the user can do:**
- See all events they've created or joined
- Each card shows: title, description, photo count, their role (Owner/Member), event code
- Click any event card → goes to event detail page
- Create a new event
- Join an existing event with a code
- Sign out

---

## 3. Organiser Flow — Creating & Managing an Event

### Step 3a: Create Event

```
Dashboard → Click "Create Event"
        │
        ▼
┌──────────────────────────┐
│  Create Event            │
│                          │
│  Title: [____________]   │
│  Description: [______]   │
│  (optional)              │
│                          │
│  [Cancel]  [Create]      │
└──────────────────────────┘
        │
        ▼
Backend generates a unique 6-character code (e.g. "A3X9K2")
User is automatically set as OWNER
Redirects to event detail page
```

### Step 3b: Share Event Code

After creating an event, the organiser needs to share the code so attendees can join.

```
Event page shows code: A3X9K2
        │
        ├── Copy code to clipboard (click copy icon)
        ├── Share via QR code (planned)
        └── Share via link (planned)

Organiser announces the code:
  "Hey everyone! Go to GrabPic, join event A3X9K2 to find your photos!"
```

### Step 3c: Upload Photos

The organiser uploads bulk event photos. This is a **multi-step process**:

```
Event Page → Click "Upload Photos"
        │
        ▼
Step 1: SELECT FILES
┌──────────────────────────────┐
│  Upload Photos               │
│                              │
│  ┌────────────────────────┐  │
│  │  Click to select or    │  │
│  │  drag & drop photos    │  │
│  │  Multiple files OK     │  │
│  └────────────────────────┘  │
│                              │
│  12 files selected           │
│  • IMG_001.jpg               │
│  • IMG_002.jpg               │
│  • ...                       │
│                              │
│  [Cancel] [Upload to Cloud]  │
└──────────────────────────────┘
        │
        ▼
Step 2: UPLOAD TO CLOUDINARY
  - Frontend gets a signed URL from backend
  - Each photo is uploaded directly to Cloudinary
  - Returns: publicId, url, width, height for each photo

        │
        ▼
Step 3: CONFIRM IN BACKEND
┌──────────────────────────────┐
│  12 files uploaded.          │
│  Confirm to save?            │
│                              │
│  [Cancel]  [Confirm]         │
└──────────────────────────────┘
  - Backend saves Photo records in database
  - Backend pushes job to Redis stream: "photo:process"
  
        │
        ▼
Step 4: AI PROCESSING (background)
  - AI worker picks up the job from Redis
  - Downloads each photo from Cloudinary
  - Runs InsightFace face detection (buffalo_l model)
  - Extracts 512-dimensional face embeddings
  - Stores embeddings in pgvector table
  - Retry logic: up to 3 attempts per photo
  - Failed jobs go to dead letter queue

        │
        ▼
✅ "12 photos uploaded! Face embeddings are being generated."
```

**Behind the scenes flow:**

```
Frontend                Backend                  Redis              AI Service
   │                       │                       │                    │
   │──signed-url request──▶│                       │                    │
   │◀──signature + params──│                       │                    │
   │                       │                       │                    │
   │──upload to Cloudinary (direct)──────────────────────────────────▶  │
   │◀──publicId, url, w, h─────────────────────────────────────────  │
   │                       │                       │                    │
   │──POST /confirm────────▶│                       │                    │
   │                       │──save Photo records──▶│                    │
   │                       │──XADD photo:process──▶│                    │
   │◀──200 OK──────────────│                       │                    │
   │                       │                       │──XREADGROUP──────▶│
   │                       │                       │                    │
   │                       │                       │    download photos │
   │                       │                       │    detect faces    │
   │                       │                       │    extract embeds  │
   │                       │                       │    store in pgvec  │
   │                       │                       │◀──XACK────────────│
```

### Step 3d: Manage Event

```
Event Page (as Owner):
  ├── View all uploaded photos in a grid
  ├── Upload more photos at any time
  ├── See photo count
  ├── Share event code
  └── Delete event (irreversible)
        → Deletes all photos from Cloudinary
        → Deletes all face embeddings
        → Deletes all member records
        → Removes event from database
```

---

## 4. Attendee Flow — Finding Your Photos

### Step 4a: Join Event

```
Dashboard → Click "Join Event"
        │
        ▼
┌──────────────────────────┐
│  Join Event              │
│                          │
│  Event Code:             │
│  [A][3][X][9][K][2]      │
│  (6-character code)      │
│                          │
│  [Cancel]  [Join]        │
└──────────────────────────┘
        │
        ▼
Backend verifies:
  ✓ Code exists → finds event
  ✓ User not already a member
  → Creates EventMember record (role: MEMBER)
  → Redirects to event detail page
```

### Step 4b: Browse Photos

```
Event Page (as Member):

┌─────────────────────────────────────────────┐
│  🎉 Company Offsite 2026                   │
│  142 photos                                 │
│                                             │
│  [Find My Photos]  [Leave Event]            │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │          │
│  │     │ │     │ │     │ │     │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │          │
│  │     │ │     │ │     │ │     │          │
│  └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
│  [Load More Photos]                         │
└─────────────────────────────────────────────┘
```

- Photos load 20 at a time (cursor-based pagination)
- Grid layout: 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- Photos can be viewed in a lightbox (click to enlarge)

### Step 4c: Face Search — The Core Feature

This is the **key differentiator** of GrabPic. The attendee scans their face to find all photos they appear in.

```
Event Page → Click "Find My Photos"
        │
        ▼
┌──────────────────────────────┐
│  Find Your Photos            │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │   👤 Upload a selfie   │  │
│  │                        │  │
│  │  We'll find photos     │  │
│  │  with your face        │  │
│  └────────────────────────┘  │
│                              │
│  Your selfie is uploaded     │
│  temporarily and not stored. │
│                              │
│  [Cancel]  [Find My Photos]  │
└──────────────────────────────┘
        │
        ▼
User selects/takes a photo of their face
        │
        ▼
Shows circular preview of selfie
        │
        ▼
Click "Find My Photos"
        │
        ▼
```

**What happens behind the scenes:**

```
Frontend                    Backend                      AI Service
   │                           │                             │
   │──POST selfie (multipart)─▶│                             │
   │                           │──verify membership──▶ DB    │
   │                           │                             │
   │                           │──POST binary image────────▶│
   │                           │                             │
   │                           │            1. Decode image  │
   │                           │            2. Detect faces  │
   │                           │            3. Extract embed │
   │                           │            4. Query pgvector│
   │                           │               cosine sim    │
   │                           │               threshold 0.3 │
   │                           │               top 20 matches│
   │                           │                             │
   │                           │◀──matched photo IDs────────│
   │                           │                             │
   │                           │──fetch Photo records──▶ DB  │
   │                           │◀──photo data──────────      │
   │                           │                             │
   │◀──matched photos list─────│                             │
   │                           │                             │
   ▼
Photos with your face are highlighted!
```

**What the user sees after scan:**

```
┌─────────────────────────────────────────────┐
│  🎉 Company Offsite 2026                   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │ ✅ Found 7 photos with your face!   │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │          │
│  │     │ │Match│ │     │ │Match│          │
│  └─────┘ └══╧══┘ └─────┘ └══╧══┘          │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│  │Match│ │ 📷  │ │Match│ │ 📷  │          │
│  │     │ │     │ │     │ │     │          │
│  └══╧══┘ └─────┘ └══╧══┘ └─────┘          │
│                                             │
│  Matched photos have green border + badge   │
└─────────────────────────────────────────────┘
```

- Matched photos get a **green border** and a **"Match" badge**
- A banner shows: "Found 7 photos with your face!"
- User can scan again with a different selfie

### Step 4d: Download Photos

```
After face search finds matches:
        │
        ├── Download all matched photos as ZIP
        │     → POST /events/:id/download { photoIds: [...] }
        │     → Backend fetches images from Cloudinary
        │     → Streams them into a ZIP archive
        │     → Browser downloads: "event-{id}-photos.zip"
        │
        └── (Future) Select specific photos to download
```

### Step 4e: Leave Event

```
Event Page → Click "Leave Event"
        │
        ▼
  Removes user from event membership
  Redirects back to dashboard
  (Note: Owner cannot leave — must delete the event instead)
```

---

## 5. Complete User Journey Map

```
                    ┌──────────────┐
                    │  Landing     │  (built separately)
                    │  Page        │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Sign In /   │
                    │  Sign Up     │
                    │  (OAuth)     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Dashboard   │◄──────────────────────┐
                    │              │                        │
                    └──┬───────┬───┘                        │
                       │       │                            │
              ┌────────┘       └────────┐                   │
              │                         │                   │
      ┌───────▼───────┐        ┌───────▼───────┐           │
      │  Create Event │        │  Join Event   │           │
      │  (Organiser)  │        │  (Attendee)   │           │
      └───────┬───────┘        └───────┬───────┘           │
              │                         │                   │
              └──────────┬──────────────┘                   │
                         │                                  │
                  ┌──────▼───────┐                          │
                  │  Event Page  │                          │
                  └──┬──┬──┬──┬─┘                          │
                     │  │  │  │                             │
         ┌───────────┘  │  │  └──────────┐                 │
         │              │  │             │                  │
  ┌──────▼──────┐ ┌────▼──▼────┐ ┌─────▼──────┐          │
  │ Upload      │ │ Find My    │ │ Delete /   │──────────▶│
  │ Photos      │ │ Photos     │ │ Leave      │           │
  │ (Owner)     │ │ (Face Scan)│ │ Event      │           │
  └──────┬──────┘ └────┬───────┘ └────────────┘           │
         │             │                                    │
         │      ┌──────▼───────┐                           │
         │      │  Matched     │                           │
         │      │  Results     │                           │
         │      └──────┬───────┘                           │
         │             │                                    │
         │      ┌──────▼───────┐                           │
         │      │  Download    │                           │
         │      │  ZIP         │                           │
         │      └──────────────┘                           │
         │                                                  │
  ┌──────▼──────┐                                          │
  │ AI Worker   │ (background)                             │
  │ processes   │                                          │
  │ faces       │                                          │
  └─────────────┘                                          │
                                                            │
                                                     ┌─────▼──────┐
                                                     │  Sign Out  │
                                                     └────────────┘
```

---

## 6. Key Technical Details for UX

| Feature | Detail |
|---------|--------|
| **Auth method** | OAuth only (Google + GitHub). No email/password. |
| **Session** | JWT cookie, 7-day expiry. HttpOnly, Secure, SameSite=None. |
| **Event code** | 6 characters, uppercase alphanumeric (e.g. A3X9K2). |
| **Photo storage** | Cloudinary (direct upload from browser via signed URLs). |
| **Face detection** | InsightFace buffalo_l model (CPU). 512-dim embeddings. |
| **Face matching** | Cosine similarity via pgvector. Threshold: 0.3. Top 20 results. |
| **Photo pagination** | Cursor-based, 20 photos per page. |
| **Download format** | ZIP archive, streamed from backend. |
| **Rate limits** | Photo upload: 500 tokens (1 per photo). Face search: 5 tokens/sec. |
| **AI processing** | Async via Redis streams. 3 retries. Dead letter queue. |
| **Selfie privacy** | Selfie is sent as binary, processed in memory, never stored. |

---

## 7. Permissions Matrix

| Action | Guest | Member | Owner |
|--------|-------|--------|-------|
| View event photos | ❌ | ✅ | ✅ |
| Face search (find my photos) | ❌ | ✅ | ✅ |
| Download photos | ❌ | ✅ | ✅ |
| Upload photos | ❌ | ❌ | ✅ |
| Delete event | ❌ | ❌ | ✅ |
| Leave event | ❌ | ✅ | ❌ |
| Join event | ✅ (logged in) | ❌ (already member) | ❌ (already member) |
| Create event | ✅ (logged in) | ✅ | ✅ |
