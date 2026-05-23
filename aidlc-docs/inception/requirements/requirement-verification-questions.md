# Requirements Verification Questions

Please answer the following questions to help clarify the requirements for the Food Bank Inventory Management System. Fill in the letter choice after each [Answer]: tag.

---

## Question 1
How should the system handle insufficient client balance during checkout?

A) Reject the entire cart — no items are dispensed
B) Allow partial checkout — dispense only what the balance covers
C) Allow overdraft — let the balance go negative (admin can settle later)
X) Other (please describe after [Answer]: tag below)

[Answer]: A, the user can then remove ietms and try again.

## Question 2
Should inventory items be organized into categories (e.g., Dairy, Bakery, Produce)?

A) Yes — items should have categories for browsing and filtering
B) No — a flat list of items is sufficient
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Should the system alert admins when inventory is running low on an item?

A) Yes — notify when stock falls below a configurable threshold
B) No — admins will manually monitor stock levels
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
How many concurrent users (admins/clients) do you expect to use the system at peak?

A) Small scale — 1-2 admins, up to 10 clients per day
B) Medium scale — 3-5 admins, up to 50 clients per day
C) Large scale — 5+ admins, 100+ clients per day
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
Should there be any transaction history or receipt functionality?

A) Yes — full transaction log viewable by both admin and client
B) Yes — transaction log viewable by admin only
C) No — no transaction history needed
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
How should admin authentication work?

A) Username and password login
B) Username and password with multi-factor authentication
C) Single Sign-On (SSO) via an existing identity provider
X) Other (please describe after [Answer]: tag below)

[Answer]: A , We can add SSO later on.

## Question 7
Should clients have any self-service capabilities (e.g., view their balance, view transaction history) or is all interaction through the admin?

A) Admin-only interaction — clients just tap their RFID card at the admin station
B) Clients can view their own balance and history via a separate screen/kiosk
C) Clients have their own login to view balance and history remotely (e.g., phone/web)
X) Other (please describe after [Answer]: tag below)

[Answer]: A, in the future we can create a client view.

## Question 8
What is the deployment target for this application?

A) Local machine only (development/demo purposes)
B) Cloud deployment (AWS, Azure, GCP)
C) On-premises server at the food bank
D) Start local, plan for cloud deployment later
X) Other (please describe after [Answer]: tag below)

[Answer]: D, We will create dockerr images for the apps to make gettting them into the cloud easier.

## Question 9
Should item costs be fixed or should admins be able to set variable pricing (e.g., discounts, free items)?

A) Fixed cost per item — set once by admin, same for all clients
B) Variable pricing — admins can set discounts or mark items as free
C) All items are free but balance represents an allocation/points system
X) Other (please describe after [Answer]: tag below)

[Answer]: both A and C.

## Question 10
For the simulated RFID card, what information should be associated with a card?

A) Just a unique card ID linked to a client profile (balance stored in the system)
B) Card ID plus a PIN for extra security
C) Card ID with the balance stored on the card itself (like a gift card)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Extension Questions

## Question 11: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 12: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: B
