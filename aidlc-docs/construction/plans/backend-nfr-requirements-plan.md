# Backend NFR Requirements Plan

## Objective
Determine non-functional requirements and finalize tech stack decisions for the Backend API unit.

## Context Already Established
- Scale: 3-5 admins, 50 clients/day
- Database: SQLite (MVP), migration-ready for PostgreSQL
- Security: Full SECURITY extension enabled
- Containerization: Docker
- Authentication: Session-based with brute-force protection

---

## Questions

### Question 1
What Python version should the backend target?

A) Python 3.11 (stable, widely supported)
B) Python 3.12 (latest stable, performance improvements)
C) Python 3.13 (newest, may have less library support)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 2
For API response time targets, what's acceptable for the checkout operation (the most complex transaction)?

A) Under 500ms (standard web app expectation)
B) Under 1 second (acceptable for a critical atomic operation)
C) Under 2 seconds (relaxed — prioritize correctness over speed)
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3
For logging, what level of detail do you want?

A) Standard — log requests, errors, and security events (login attempts, checkouts)
B) Verbose — log all of the above plus all database queries and service method calls (useful for debugging)
X) Other (please describe after [Answer]: tag below)

[Answer]: A, with ability to update logging to verbose

### Question 4
For testing framework, which do you prefer?

A) pytest + pytest-django (more flexible, popular in Python community)
B) Django's built-in unittest framework (no extra dependency)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Execution Steps

- [x] Step 1: Define performance requirements (response times, throughput)
- [x] Step 2: Define security requirements (mapping to SECURITY rules)
- [x] Step 3: Define reliability requirements (error handling, data integrity)
- [x] Step 4: Finalize tech stack decisions (versions, libraries, tools)
- [x] Step 5: Generate nfr-requirements.md
- [x] Step 6: Generate tech-stack-decisions.md
- [x] Step 7: Validate against SECURITY extension rules
