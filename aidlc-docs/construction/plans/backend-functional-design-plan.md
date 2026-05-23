# Backend Functional Design Plan

## Objective
Define detailed business logic, domain entities, and business rules for the Backend API unit (Django `core` app).

---

## Questions

### Question 1
For the balance field on Client, what precision do you want?

A) 2 decimal places (standard currency: $10.50)
B) No decimals — whole dollar amounts only ($10, $25)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
When an admin adds balance to a client, should there be a maximum single-addition limit?

A) No limit — admin can add any positive amount
B) Yes — cap at a specific maximum per addition (e.g., $500)
X) Other (please describe after [Answer]: tag below)

[Answer]: B, start with $2000

### Question 3
For the transaction history, should deleted/modified items show their original name and cost at the time of purchase, or the current item data?

A) Snapshot — store item name and cost at time of purchase in the transaction record (accurate history even if item changes later)
B) Reference — link to current item data (simpler, but history changes if item is renamed/repriced)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
Should there be a maximum number of active carts (one per client, or can an admin have multiple clients' carts open)?

A) One active cart per client at a time (starting a new one cancels any existing)
B) Multiple carts allowed — admin can switch between clients' carts
X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Execution Steps

- [x] Step 1: Define domain entities with all fields, types, and constraints
- [x] Step 2: Define business rules for each service (CheckoutService, InventoryService, ClientService, AuthService)
- [x] Step 3: Define business logic flows (checkout sequence, balance operations, stock management)
- [x] Step 4: Generate domain-entities.md
- [x] Step 5: Generate business-rules.md
- [x] Step 6: Generate business-logic-model.md
- [x] Step 7: Validate completeness against all assigned stories
