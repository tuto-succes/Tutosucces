# StudentDashboard Component Structure & Data Flow Analysis

## 1. StudentDashboard.tsx - Main Component Structure

### Location
[src/components/StudentDashboard.tsx](src/components/StudentDashboard.tsx)

### Tabs Navigation (7 Tabs)
The dashboard is organized using React Tabs with the following sections:

1. **Recherche (Search)** → `<TutorSearch />`
2. **Séances (Sessions)** → `<SessionsList />`
3. **Messages** → `<MessagesPanel />`
4. **Paiements (Payments)** → `<PaymentsHistory />`
5. **Bilans (Progress Reports)** → `<ProgressReports />`
6. **Relevés fiscaux (Tax Receipts)** → `<StudentTaxReceipts />`
7. **Paramètres (Settings)** → `<SettingsPanel />`

### Component Structure
```
StudentDashboard
├── Header
│   ├── Logo + Branding
│   ├── User Info
│   └── Logout Button
├── Welcome Section
└── Tabs Container
    ├── TutorSearch (search tab)
    ├── SessionsList (sessions tab)
    ├── MessagesPanel (messages tab)
    ├── PaymentsHistory (payments tab)
    ├── ProgressReports (progress tab)
    ├── StudentTaxReceipts (tax-receipts tab)
    └── SettingsPanel (settings tab)
```

---

## 2. Student-Related Components Overview

### Components in `src/components/student/` folder:

| File | Purpose | Key Props |
|------|---------|-----------|
| **TutorSearch.tsx** | Search & filter tutors by subject, level, availability | `userId`, `accessToken` |
| **SessionsList.tsx** | Display student's sessions with status filtering | `userId`, `accessToken`, `role` |
| **MessagesPanel.tsx** | Conversations with tutors | `userId`, `accessToken` |
| **PaymentsHistory.tsx** | Payment records & invoicing | `userId`, `accessToken` |
| **ProgressReports.tsx** | Progress bilans from tutors | `userId`, `accessToken` |
| **ProgressReportDialog.tsx** | Dialog for creating progress reports | - |
| **InvoiceDialog.tsx** | Invoice details dialog | - |
| **StudentTaxReceipts.tsx** | Tax receipts management | `studentId`, `studentName`, `parentName`, `parentEmail` |
| **SettingsPanel.tsx** | Profile & preference settings | `userId`, `accessToken` |
| **TutorCalendar.tsx** | Calendar view (not currently used in main dash) | - |
| **TutorBookingDialog.tsx** | Booking confirmation dialog | - |

---

## 3. TutorSearch.tsx - Detailed Structure

### Purpose
Allow students to search for tutors and filter by multiple criteria including real-time availability.

### Key Features

#### Filter Sections:
1. **Availability Search (Primary)**
   - Date input
   - Time input
   - Duration selection (1h, 1.5h, 2h, 3h)
   - Real-time availability verification

2. **Additional Filters**
   - Subject filter (dropdown with all subjects)
   - Level filter (Primaire, Secondaire, CÉGEP)
   - Name/subject search (text input)

### Search Logic
```typescript
filterTutors() {
  1. Filter by text search (name, bio, subjects)
  2. Filter by subject
  3. Filter by level
  4. Filter by availability (if date+time specified)
     └─ Uses isTutorAvailable() function
}
```

### Tutor Display (Card Grid - 2-3 columns)

Each tutor card shows:
- **Name** + Rating ⭐ + Review count
- **Bio** (3 lines max)
- **Subjects** (colored badges)
- **Levels** (education levels taught)
- **Availability Days** (Dim, Lun, Mar, etc.)
- **"Réserver une séance" (Book Session) button**

### Booking Dialog
Clicking "Réserver une séance" opens a modal with:
- Date & time picker
- Duration selector
- Subject selector (filtered to tutor's subjects)
- Notes/objectives text area
- **Price calculation** (duration × hourly rate)
- **Availability check** (green/red alert)
- **Payment section** (Stripe integration - currently simulated)
- Confirm booking button (only active after payment)

### State Variables
```typescript
tutors: any[]                      // All fetched tutors
filteredTutors: any[]             // Results after filters
searchQuery: string               // Free text search
subjectFilter: string             // Subject dropdown
levelFilter: string               // Level dropdown
searchDate: string                // Date for availability search
searchTime: string                // Time for availability search
searchDuration: string            // Duration for availability search
selectedTutor: any                // Currently selected tutor for booking
bookingDate: string               // Selected booking date/time
bookingDuration: string           // Selected booking duration
bookingSubject: string            // Selected subject
bookingNotes: string              // Booking notes
paymentSuccess: boolean           // Payment completion status
```

---

## 4. SessionsList.tsx - Detailed Structure

### Purpose
Display all sessions for a student with status filtering and management.

### Key Features

#### Status Filter
- All (default)
- Pending (En attente)
- Confirmed (Confirmée)
- Completed (Terminée)
- Cancelled (Annulée)

#### Session Card Display
Each session shows:
- **Date** (formatted: "mercredi 5 mars 2026")
- **Time** (from session.time, displayed as HH:mm)
- **Tutor Name**
- **Subject**
- **Session Notes** (if provided)
- **Tutor Comments** (blue box if present)
- **Zoom Link** (green box for confirmed sessions with video link)
- **Status Badge**
- **Duration** (in hours)

### Session Data Structure
```typescript
interface Session {
  id: string
  studentId: string
  tutorId: string
  studentName: string
  tutorName: string
  date: string              // ISO date string
  time: string              // "HH:mm" format
  duration: number          // hours (1, 1.5, 2, 3, etc)
  subject: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'pending'
  notes?: string
  zoomLink?: string | null
  tutorComment?: string | null
}
```

### Session Storage
- **Primary source**: Mock data from `mockSessions` array
- **Secondary source**: localStorage (`mockSessions` key)
- Sessions are persisted to localStorage when updated

### Status Badge Variants
- pending: yellow "En attente"
- confirmed: default blue "Confirmée"
- completed: secondary gray "Terminée"
- cancelled: red "Annulée"

---

## 5. Data Structures & Mock Data

### Tutor Data Structure
```typescript
{
  userId: string
  user: { 
    name: string
    email: string 
  }
  subjects: string[]       // ["Mathématiques", "Physique", "Chimie"]
  levels: string[]         // ["Secondaire", "CÉGEP"]
  mode: string[]           // ["online", "presentiel"]
  rate: number             // hourly rate in CAD
  bio: string
  rating: number           // 0-5
  reviewCount: number
  approved: boolean
  availability: DayAvailability[]
}
```

### Availability Data Structure
```typescript
interface DayAvailability {
  dayOfWeek: number        // 0=Sunday, 1=Monday, ... 6=Saturday
  slots: TimeSlot[]
}

interface TimeSlot {
  start: string            // "HH:mm" format
  end: string              // "HH:mm" format
}

// Example:
{
  dayOfWeek: 1,            // Monday
  slots: [
    { start: '09:00', end: '12:00' },
    { start: '14:00', end: '18:00' }
  ]
}
```

### Mock Data Location
[src/utils/mockData.tsx](src/utils/mockData.tsx)

**Constants:**
- `mockTutors`: Array of 4 tutors (Marie Dubois, Jean Tremblay, Sophie Martin, Thomas Gagnon)
- `mockSessions`: Array of sessions with various statuses and students

---

## 6. Availability Checking Logic

### Function: `isTutorAvailable()`
Location: [src/utils/mockData.tsx](src/utils/mockData.tsx#L625)

```typescript
isTutorAvailable = (tutor: any, requestedDateTime: Date, durationHours: number): boolean
```

**Algorithm:**
1. Extract day of week from requested DateTime
2. Convert requested time to minutes (from midnight)
3. Find availability slots for that day of week
4. For each slot, check if:
   - requestedTime >= slotStart AND
   - requestedTime + duration <= slotEnd
5. Return true if any slot can accommodate the request

**Example:**
- Tutor available Monday 09:00-12:00
- Request: Monday 10:00, duration 1.5h (ends 11:30)
- Result: ✓ Available (fits within 09:00-12:00)

---

## 7. Current Mock Data Sample

### Tutors (4 examples)
1. **Marie Dubois** - Sciences (Math, Physics, Chemistry), Sec/CÉGEP, $35/h, 4.8★
   - Mon: 09-12, 14-18 | Tue: 10-16 | Wed: 14-20 | Thu: 09-12, 16-19 | Fri: 10-17

2. **Jean Tremblay** - French/Literature/History, Primary/Sec, $30/h, 4.9★
   - Mon-Thu: 13-19 | Wed: 15-21 | Sat: 09-15

3. **Sophie Martin** - Languages (English, Spanish), All levels, $40/h, 5.0★
   - Mon: 08-12, 14-17 | Tue-Fri: 08-17

4. **Thomas Gagnon** - Math/CS/Programming, Sec/CÉGEP, $45/h, 4.7★
   - Mon-Thu: 18-22 | Sat-Sun: 10-18

### Sample Sessions (Student "student-1")
1. **session-1**: Marie Dubois, Math, 2026-03-05 14:00, 1.5h, **COMPLETED**
2. **session-2**: Jean Tremblay, French, 2026-03-08 10:00, 2h, **SCHEDULED**
3. **session-3**: Sophie Martin, English, 2026-02-28 16:00, 1h, **COMPLETED**
4. **session-4**: Marie Dubois, Physics, 2026-03-12 15:00, 1h, **PENDING**

---

## 8. Search & Filtering Flow

### TutorSearch Flow Diagram
```
User Input
├── Availability Search (date + time + duration)
│   └─> isTutorAvailable() checks each tutor
├── Subject Filter
├── Level Filter
└── Free Text Search

     ↓

filterTutors() combines all filters

     ↓

filteredTutors displayed in grid

     ↓

Click tutor card → open Booking Dialog
```

### Session Filtering Flow
```
Sessions loaded from localStorage

     ↓

User selects status filter

     ↓

filteredSessions = sessions.filter(s => s.status === selectedFilter)

     ↓

Render filtered sessions in list
```

---

## 9. Key Data Flow Connections

### How Sessions are Displayed
1. **SessionsList** fetches with `getMockSessions(userId, 'student')`
2. Loads from `localStorage` (if exists) or uses `mockSessions`
3. Filters by studentId
4. Displays with status filtering
5. Can update status → saves back to localStorage

### How Tutors & Availability are Linked
1. **TutorSearch** fetches `getMockTutors()`
2. Each tutor has `availability: DayAvailability[]`
3. When user selects date/time in search:
   - `isTutorAvailable()` extracts day & time
   - Checks against tutor's availability slots
   - Filters results to only available tutors
4. Selected tutor → Booking Dialog pre-fills subject if filtered

### Budget/Price Calculation
```
Session Price = tutor.rate × duration
Example: $35/h × 1.5h = $52.50
```

---

## 10. Mock Data Functions

Location: [src/utils/mockData.tsx](src/utils/mockData.tsx)

| Function | Returns | Used By |
|----------|---------|---------|
| `getMockTutors()` | `Promise<mockTutors[]>` | TutorSearch |
| `getMockSessions(userId?, role?)` | `Promise<Session[]>` | SessionsList, TutorDashboard |
| `getMockMessages(userId)` | `Promise<Message[]>` | MessagesPanel |
| `getMockPayments(userId)` | `Promise<Payment[]>` | PaymentsHistory |
| `getMockInvoices(userId)` | `Promise<Invoice[]>` | StudentTaxReceipts |
| `isTutorAvailable(tutor, dateTime, duration)` | `boolean` | TutorSearch (availability check) |
| `getAllSubjects()` | `string[]` | TutorSearch (subject dropdown) |
| `simulateNetworkDelay(ms?)` | `Promise<void>` | All mock functions |

---

## 11. Current Limitations & Notes

### What's Mock
- ✓ Tutor data & availability
- ✓ Sessions & session updates
- ✓ Payment processing (simulated)
- ✓ Messages & payments

### What's Pending
- Stripe integration (currently simulated)
- Real database connection
- Real Zoom link generation
- Real session creation/booking persistence

### Payment Flow (Current)
1. User clicks "Procéder au paiement"
2. Opens simulated payment dialog
3. User clicks "Simuler le paiement"
4. Sets `paymentSuccess = true`
5. Enables "Confirmer la réservation" button
6. Clicking confirm → alert & resets

---

## 12. Component Import Dependencies

```typescript
// UI Components
Button, Input, Card, Tabs, Dialog, Label
Select, Badge, Alert, Textarea

// Icons (lucide-react)
Calendar, Clock, User, Search, Star, MapPin, 
BookOpen, CreditCard, Video, MessageSquare, etc.

// Custom Components
TutorSearch, SessionsList, MessagesPanel, 
PaymentsHistory, ProgressTracking, SettingsPanel, 
ProgressReports, StudentTaxReceipts

// Utilities
getMockTutors, getMockSessions, isTutorAvailable, 
getAllSubjects, simulateNetworkDelay from mockData.tsx
supabase client
```

---

## Summary

The StudentDashboard follows a **tab-based architecture** with **TutorSearch** being the primary entry point for finding tutors. The availability system uses a **day-of-week + time slot** model that is checked in real-time against student requests. Sessions are stored in **localStorage** for mock persistence and display via tabs for easy status filtering. The entire system is currently based on mock data with clear pathways for database integration.

