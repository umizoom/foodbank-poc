# Frontend NFR Requirements

## Performance

| Requirement | Target | Rationale |
|---|---|---|
| Initial page load (LCP) | < 3 seconds on localhost | Internal tool, single bundle, local network |
| Route navigation | < 500ms perceived | Client-side routing, no full reload |
| API response display | < 2 seconds end-to-end | Backend target is < 2s; frontend adds minimal overhead |
| Form submission feedback | Immediate (< 100ms) | Disable button + show spinner instantly on click |
| Search/filter debounce | 300ms | Prevent excessive API calls while typing |

**Bundle strategy**: Single bundle (no code-splitting). Internal tool with predictable network conditions. Simplicity over optimization.

---

## Security

| Requirement | Implementation | SECURITY Rule |
|---|---|---|
| XSS Prevention | React's default JSX escaping; no `dangerouslySetInnerHTML`; sanitize any user-rendered content | SEC-003 |
| CSRF Protection | Django session cookie + CSRF token via cookie; fetch includes `credentials: 'include'` | SEC-004 |
| Sensitive Data | No tokens/secrets in localStorage or sessionStorage; auth via httpOnly session cookie only | SEC-007 |
| Input Validation | Client-side validation via React Hook Form (defense-in-depth; server is authoritative) | SEC-005 |
| Dependency Security | `npm audit` in CI; no known-vulnerable dependencies | SEC-010 |
| Content Security Policy | CSP headers served by backend/reverse proxy (not frontend concern at build time) | SEC-011 |
| No Inline Scripts | Vite build produces external JS bundles; no inline `<script>` tags | SEC-011 |
| API Error Disclosure | Never display raw server error messages to user; show friendly messages | SEC-009 |

---

## Reliability

| Requirement | Implementation |
|---|---|
| Error Boundaries | React ErrorBoundary at app root catches render crashes; shows recovery UI |
| API Failure Handling | All API calls wrapped with try/catch; display user-friendly error messages |
| Network Resilience | Timeout on fetch calls (30s); show "connection lost" banner on network failure |
| Session Expiry | Graceful redirect to login with informative message on 401 |
| State Recovery | Cart state persisted on server (DB); page refresh does not lose checkout progress |
| Offline Behavior | No offline support required (internal tool, always on LAN) |

---

## Maintainability

| Requirement | Tool/Approach |
|---|---|
| Type Safety | TypeScript strict mode (`strict: true` in tsconfig) |
| Linting | ESLint with `@typescript-eslint` + React plugins |
| Formatting | Prettier (consistent code style) |
| Testing | Vitest + React Testing Library (component + hook tests) |
| Code Organization | Feature-based folder structure with clear boundaries |
| Import Paths | Path aliases (`@/features/...`, `@/shared/...`) via Vite config |

---

## Usability / Accessibility

| Requirement | Implementation |
|---|---|
| Semantic HTML | Use `<nav>`, `<main>`, `<form>`, `<button>`, `<table>` appropriately |
| Keyboard Navigation | All interactive elements reachable via Tab; Enter/Space to activate |
| Form Labels | Every input has an associated `<label>` (via `htmlFor` or wrapping) |
| Focus Management | Focus moves to error on form submission failure; focus trapped in modals |
| Error Announcements | Form errors associated with fields via `aria-describedby` |
| Color Independence | Low-stock indicators use icon + color (not color alone) |
| Responsive Design | Not required (admin desktop workstation); minimum viewport 1024px |

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Edge | Last 2 versions |
| Safari | Last 2 versions |

**Browserslist config**: `defaults, not IE 11, not op_mini all`

No polyfills required. Modern ES2020+ features used freely (optional chaining, nullish coalescing, etc.)

---

## Testing Requirements

| Category | Scope | Tool |
|---|---|---|
| Component Tests | All form components, shared components, key pages | Vitest + React Testing Library |
| Hook Tests | Custom hooks (useItems, useClients, etc.) | Vitest + renderHook |
| Utility Tests | Currency formatting, validation helpers | Vitest |
| API Client Tests | Request/error handling logic | Vitest + MSW (Mock Service Worker) |
| Coverage Target | > 70% line coverage | vitest --coverage |

**Not included**: E2E tests (deferred to Build & Test stage if needed), visual regression tests, performance benchmarks.
