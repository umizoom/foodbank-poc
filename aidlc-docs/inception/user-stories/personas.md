# User Personas

## Persona 1: Food Bank Administrator (Admin)

| Attribute | Description |
|---|---|
| **Name** | Alex (representative) |
| **Role** | Food Bank Staff / Volunteer Admin |
| **System Access** | Full system access via username/password login |
| **Goals** | Efficiently manage inventory, register clients, process checkouts, maintain accurate records |
| **Frustrations** | Manual tracking errors, slow checkout processes, not knowing when items are running low |
| **Technical Skill** | Basic to intermediate — comfortable with web applications but not technical |
| **Usage Pattern** | Daily use during food bank operating hours (3-5 admins concurrently) |
| **Key Workflows** | Login, manage inventory, register clients, add client balance, process checkout, view transaction history |

### Characteristics
- Needs a simple, fast checkout interface to serve clients efficiently
- Manages inventory restocking and wants visibility into what's running low
- Handles client registration and balance top-ups
- Needs access to transaction history for record-keeping and accountability

---

## Persona 2: Food Bank Client (Data Subject)

| Attribute | Description |
|---|---|
| **Name** | Maria (representative) |
| **Role** | Food bank recipient / Community member |
| **System Access** | None — interacts only via RFID card at admin station |
| **Goals** | Receive food items within their allocated balance |
| **Frustrations** | Not knowing remaining balance, unclear what items are available |
| **Technical Skill** | Varies widely — not relevant since no direct system interaction |
| **Usage Pattern** | Visits food bank periodically, presents RFID card to admin for checkout |
| **Key Workflows** | Present card to admin, admin processes items, card balance is deducted |

### Characteristics
- Does not log into the system (admin-only interaction for MVP)
- Has an RFID card linked to their profile and balance
- Balance is loaded by admin (real currency allocation)
- Future enhancement: self-service portal to view balance and history

---

## Persona Mapping to System Features

| Feature Area | Admin | Client |
|---|---|---|
| Authentication | Primary user | N/A |
| Inventory Management | Full CRUD | N/A |
| Client Management | Create, view, edit clients | Data subject |
| Balance Management | Add balance to clients | Receives balance |
| Checkout | Operates checkout station | Presents RFID card |
| Transaction History | Views all transactions | N/A (future) |
| Low Stock Alerts | Receives alerts | N/A |
