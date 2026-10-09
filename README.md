# CampusCart — Student-to-Student Campus Marketplace

> **Tagline:** Buy Smart. Sell Easy. Campus Connected.  
> **Capstone Project:** Final-Year B.Tech Computer Science and Engineering

CampusCart is a modern, responsive, full-stack peer-to-peer marketplace application engineered for college and university students. It empowers students to buy, sell, exchange, and donate reusable textbooks, scientific calculators, stationery, electronics, lab supplies, and hostel living essentials within their verified campus community.

---

## 1. Architectural Overview

CampusCart is built as a production-minded full-stack web application with complete separation of concerns:

- **Frontend:** React 19 SPA with TypeScript, Tailwind CSS v4, Lucide React icons, and accessible responsive layouts.
- **Backend:** Node.js Express server running RESTful endpoints with PBKDF2 password hashing, secure token sessions, and role-based access control (RBAC).
- **Persistence:** File-backed persistent database (`.data/campuscart.json`) ensuring data survives page reloads and server restarts.
- **AI Integration:** Google GenAI SDK (`@google/genai`) with model `gemini-3.8-flash` on the server for listing description drafting, smart category detection, and listing quality score auditing.
- **Safety & Privacy:** Controlled buyer-seller enquiry inbox preventing public exposure of student phone numbers and email addresses.

---

## 2. User Roles & Demonstration Accounts

The platform includes 3 distinct user roles with server-side authorization enforcement:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Moderation Admin** | `admin@campuscart.edu` | `Admin@123` | Protected admin dashboard, review reports, remove listings, manage categories, suspend accounts |
| **Student Seller** | `aravind.cse@campuscart.edu` | `Student@123` | NIT Trichy, 4th Year B.Tech CSE; owner of textbooks, laptop stands & study lamps |
| **Student Buyer** | `priya.ece@campuscart.edu` | `Student@123` | IIT Delhi, 3rd Year B.Tech ECE; active buyer with wishlist items and enquiries |
| **Student Peer** | `rohit.mech@campuscart.edu` | `Student@123` | BITS Pilani, 2nd Year Mech; owns calculator, drafter, badminton racket |

*Quick test helper:* The Sign In modal features a **1-Click Demo Login** bar allowing evaluators to switch between Admin, Seller, and Buyer profiles instantly.

---

## 3. Key Pages & Features Implemented

### 1. Landing Page (`/`)
- Hero banner with headline: *"Your Campus. Your Marketplace."*
- Instant search bar with auto-redirect to filtered marketplace
- Academic category grid with counts
- Recently listed student essentials grid
- 3-step *"How CampusCart Works"* explanation
- Campus circular economy & student sustainability impact statement

### 2. Searchable Marketplace
- Multi-dimensional filters: Category, Condition, Price range (INR), College, Transaction type (Sale, Exchange, Donation)
- Sort by Newest, Price (Low to High), and Price (High to Low)
- Grid view and List view toggling
- Pagination and responsive empty state with "Reset All Filters"
- Fast wishlist toggle directly from product cards

### 3. Product Details (PDP)
- Gallery with multiple product photo previews
- Pricing in INR (`₹`) with original MRP comparison and discount badge
- Item condition, listing date, and pickup location description
- Public verified seller card (protects private contact information)
- "Contact Seller" modal triggering the in-app enquiry inbox
- "Add to Wishlist" and "Report Listing" affordances
- Similar products carousel

### 4. Authentication & Security
- Registration with Full Name, Academic Email, Password, College, Branch, and Year of study
- PBKDF2 password hashing with cryptographically secure random salt
- Session token generation with 7-day TTL
- Automatic academic verification detection for `.edu` / `.ac.in` domains

### 5. Listing Creation & Management
- Product Title, Category, Selling Price, Original MRP, Condition, and Transaction Type
- Image file uploader with size check, preview, deletion, or vector SVG presets
- Campus pickup location description
- **AI Listing Description Assistant:** Leverages Gemini (`gemini-3.8-flash`) to generate structured, realistic student listing descriptions
- **AI Smart Category Suggestion:** Auto-identifies matching category based on title and description
- **AI Quality Score Auditor:** Grades listing completeness (0–100) and gives actionable suggestions

### 6. Student Dashboard
- Real database-backed statistics (Total Listings, Active, Sold, Saved Wishlist)
- **My Listings:** Edit, Pause, Mark as Sold, Delete with confirmation
- **Saved Wishlist:** View and manage bookmarked items
- **Received Enquiries:** Inbound queries from buyers with in-app reply mechanism
- **Profile Settings & Email Notifications:**
  - Update student name, college, department, degree, and bio
  - **Email Notification Toggles:**
    - Toggle alerts for **New Buyer Enquiries** (ensures sellers never miss a prospective buyer's message)
    - Toggle alerts for **Seller Responses** to submitted queries
    - Toggle alerts for **Listing Status & Moderation Updates**
    - Toggle alerts for **Campus Marketplace Bulletins**
  - **Test Notification Dispatcher:** 1-click test button verifying email alert routing to the student's campus email address.

### 7. Protected Admin Dashboard
- RBAC middleware protection (HTTP 403 Forbidden for non-admins)
- System overview metrics: Registered Users, Active Listings, Sold Items, Pending Reports, Total Enquiries
- Real-time marketplace activity stream
- Listing moderation table (remove with recorded violation reason, restore)
- User account management table (suspend with recorded reason, reactivate)
- Academic Category taxonomy manager (add, toggle active)
- Safety Reports review queue (resolve with moderator notes, dismiss)
- "Reset Demo Seeds" tool for easy testing

---

## 4. Backend REST APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue session token |
| `POST` | `/api/auth/logout` | Authenticated | Destroy active session |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update user profile details |
| `GET` | `/api/listings` | Public | Search, filter, and paginate listings |
| `GET` | `/api/listings/:id` | Public | Retrieve single listing with seller profile |
| `POST` | `/api/listings` | Authenticated | Create a new campus listing |
| `PUT` | `/api/listings/:id` | Owner / Admin | Update listing details |
| `DELETE` | `/api/listings/:id` | Owner / Admin | Delete listing |
| `PATCH` | `/api/listings/:id/status` | Owner / Admin | Update status (Active, Sold, Unavailable, Removed) |
| `GET` | `/api/categories` | Public | Get all active categories |
| `POST` | `/api/categories` | Admin Only | Create new category |
| `GET` | `/api/wishlist` | Authenticated | Get user's saved wishlist |
| `POST` | `/api/wishlist` | Authenticated | Add item to wishlist |
| `DELETE` | `/api/wishlist/:listingId` | Authenticated | Remove item from wishlist |
| `GET` | `/api/enquiries` | Authenticated | Get user's received and sent enquiries |
| `POST` | `/api/enquiries` | Authenticated | Submit buyer enquiry (prevents self-messaging) |
| `PATCH` | `/api/enquiries/:id/status` | Participant | Update enquiry status or append seller reply |
| `POST` | `/api/reports` | Authenticated | Submit safety report |
| `GET` | `/api/reports/admin` | Admin Only | Review all safety reports |
| `PATCH` | `/api/reports/admin/:id` | Admin Only | Resolve or dismiss safety report |
| `GET` | `/api/admin/overview` | Admin Only | Aggregate system stats & activity feed |
| `GET` | `/api/admin/users` | Admin Only | Manage all registered users |
| `PATCH` | `/api/admin/users/:id/status` | Admin Only | Suspend or reactivate student account |
| `POST` | `/api/admin/reset-demo` | Admin Only | Reset database to initial seed data |
| `POST` | `/api/ai/describe` | Authenticated | Gemini AI listing description generator |
| `POST` | `/api/ai/suggest-category` | Authenticated | Gemini AI category detector |
| `POST` | `/api/ai/quality-check` | Authenticated | Gemini AI listing quality audit |

---

## 5. Local Setup & Development

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn

### Installation
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (refer to `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Start the full-stack development server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

---

## 6. Pre-seeded Demo Listings (12 Items)

1. **Data Structures and Algorithms in C++** (Mark Allen Weiss, 4th Ed) — ₹250 (NIT Trichy)
2. **Higher Engineering Mathematics** (B.S. Grewal, 44th Ed) — ₹300 (IIT Delhi)
3. **Casio FX-991EX ClassWiz Scientific Calculator** — ₹450 (BITS Pilani)
4. **Ergonomic Aluminum Laptop Stand** — ₹350 (NIT Trichy)
5. **Computer Networking: A Top-Down Approach** (Kurose & Ross) — ₹280 (IIT Delhi)
6. **Engineering Mini-Drafter and Drawing Set** — ₹200 (BITS Pilani)
7. **Rechargeable LED Desk Study Lamp** — ₹180 (NIT Trichy)
8. **The C Programming Language** (Kernighan & Ritchie) — ₹320 (IIT Delhi)
9. **Yonex Muscle Power Badminton Racket** — ₹500 (BITS Pilani)
10. **Wildcraft 30L Water-Resistant Laptop Backpack** — ₹400 (NIT Trichy)
11. **Logitech MK215 Wireless Keyboard & Mouse Combo** — ₹350 (IIT Delhi)
12. **Pure Cotton White Lab Coat (Size M)** — ₹220 (BITS Pilani)

---

## 7. Remaining Limitations & Future Roadmap

- **University ID Card OCR:** Future versions can integrate Gemini Flash 2.5 vision to auto-verify college ID card photographs.
- **In-App Real-Time WebSockets:** While the persistent enquiry inbox stores all messages and responses safely, adding real-time chat via WebSockets can speed up instant handovers.
- **Campus Geofencing:** Optional Google Maps Platform integration to visualize designated safe exchange zones (e.g., student unions, campus security booths).
