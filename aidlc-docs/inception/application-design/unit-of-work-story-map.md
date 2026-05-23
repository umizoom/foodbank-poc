# Unit of Work — Story Map

## Story-to-Unit Assignment

### Unit 1: Backend API

| Story ID | Story Title | Rationale |
|---|---|---|
| US-1.1 | Admin Login | Auth logic, session creation — backend |
| US-1.2 | Admin Logout | Session invalidation — backend |
| US-1.3 | Session Timeout | Session expiry configuration — backend |
| US-2.1 | Add Inventory Item | Model creation, validation — backend |
| US-2.2 | Edit Inventory Item | Model update — backend |
| US-2.3 | Delete Inventory Item | Model deletion with referential integrity — backend |
| US-2.4 | View Inventory List | List/filter/search API — backend |
| US-2.5 | Update Stock Count | Stock adjustment logic — backend |
| US-2.6 | Manage Categories | Category CRUD — backend |
| US-3.1 | Register New Client | Client model creation — backend |
| US-3.2 | View Client List | List/search API — backend |
| US-3.3 | View Client Details | Detail API with transactions — backend |
| US-3.4 | Add Balance to Client | Balance logic + audit log — backend |
| US-3.5 | Edit Client Information | Client update with uniqueness check — backend |
| US-4.1 | Identify Client via RFID | Card lookup API — backend |
| US-4.2 | Add Items to Cart | Cart management, stock validation — backend |
| US-4.3 | Remove Items from Cart | Cart item removal — backend |
| US-4.4 | Process Checkout | Atomic checkout transaction — backend |
| US-4.5 | Cancel Checkout | Cart cancellation — backend |
| US-5.1 | View Transaction List | Transaction list API with filters — backend |
| US-5.2 | View Transaction Details | Transaction detail API — backend |
| US-6.1 | Low Stock Visual Indicator | Low-stock query endpoint — backend |
| US-6.2 | Configure Low Stock Threshold | Threshold field on item model — backend |

**Total: 23 stories** (all stories have backend implementation)

---

### Unit 2: Frontend SPA

| Story ID | Story Title | Rationale |
|---|---|---|
| US-1.1 | Admin Login | Login form UI — frontend |
| US-1.2 | Admin Logout | Logout button/action — frontend |
| US-1.3 | Session Timeout | Timeout detection + redirect — frontend |
| US-2.1 | Add Inventory Item | Item creation form — frontend |
| US-2.2 | Edit Inventory Item | Item edit form — frontend |
| US-2.3 | Delete Inventory Item | Delete confirmation modal — frontend |
| US-2.4 | View Inventory List | List page with filters/search — frontend |
| US-2.5 | Update Stock Count | Stock adjustment UI — frontend |
| US-2.6 | Manage Categories | Category management UI — frontend |
| US-3.1 | Register New Client | Client registration form — frontend |
| US-3.2 | View Client List | Client list page with search — frontend |
| US-3.3 | View Client Details | Client detail page — frontend |
| US-3.4 | Add Balance to Client | Balance top-up form — frontend |
| US-3.5 | Edit Client Information | Client edit form — frontend |
| US-4.1 | Identify Client via RFID | Card simulator UI (button/input) — frontend |
| US-4.2 | Add Items to Cart | Item browser + cart building UI — frontend |
| US-4.3 | Remove Items from Cart | Cart item removal/quantity adjustment — frontend |
| US-4.4 | Process Checkout | Checkout confirmation UI + error display — frontend |
| US-4.5 | Cancel Checkout | Cancel button — frontend |
| US-5.1 | View Transaction List | Transaction list page with filters — frontend |
| US-5.2 | View Transaction Details | Transaction detail page — frontend |
| US-6.1 | Low Stock Visual Indicator | Visual highlighting + badge count — frontend |
| US-6.2 | Configure Low Stock Threshold | Threshold field in item form — frontend |

**Total: 23 stories** (all stories have frontend implementation)

---

### Unit 3: Docker / Orchestration

| Story ID | Story Title | Rationale |
|---|---|---|
| — | (No direct story mapping) | Infrastructure unit supporting deployment |

**Supports all stories** by providing containerized deployment environment.

---

## Coverage Summary

| Unit | Stories Assigned | Coverage |
|---|---|---|
| Backend API | 23 | 100% of all stories |
| Frontend SPA | 23 | 100% of all stories |
| Docker | 0 (supports all) | Infrastructure layer |

**Note**: All 23 stories span both backend and frontend since each story requires both API implementation and UI implementation. The backend-first approach means API endpoints are built and tested first, then the frontend consumes them.

## Construction Phase Execution Plan

| Unit | Functional Design | NFR Requirements | NFR Design | Code Generation |
|---|---|---|---|---|
| Backend API | Yes | Yes | Yes | Yes |
| Frontend SPA | Yes | Yes | Yes | Yes |
| Docker | No | No | No | Yes (Code Gen only) |
