# Frontend Tech Stack Decisions

## Core Framework

| Technology | Version | Rationale |
|---|---|---|
| React | 18.x | Stable, widely supported, hooks-based architecture |
| TypeScript | 5.x | Type safety, better DX, catch errors at compile time |
| Vite | 5.x | Fast dev server (HMR), optimized production builds, native ESM |

## Styling

| Technology | Version | Rationale |
|---|---|---|
| Tailwind CSS | 3.x | Utility-first, rapid development, no custom CSS files, small production bundle (purged) |
| PostCSS | 8.x | Required by Tailwind, handles directives |

## Routing

| Technology | Version | Rationale |
|---|---|---|
| React Router | 6.x | Industry standard, well-documented, familiar API |

## Forms

| Technology | Version | Rationale |
|---|---|---|
| React Hook Form | 7.x | Performant (uncontrolled inputs), minimal re-renders, built-in validation, small bundle |

## State Management

| Technology | Version | Rationale |
|---|---|---|
| React Context + useReducer | (built-in) | Sufficient for app-wide auth state; no external library needed |

## HTTP Client

| Technology | Version | Rationale |
|---|---|---|
| fetch (native) | (built-in) | No dependency needed; thin wrapper sufficient for REST calls |

## Testing

| Technology | Version | Rationale |
|---|---|---|
| Vitest | 1.x | Vite-native, fast, Jest-compatible API |
| @testing-library/react | 14.x | Best practices for component testing (user-centric queries) |
| @testing-library/user-event | 14.x | Realistic user interaction simulation |
| MSW (Mock Service Worker) | 2.x | API mocking at network level for isolated component tests |
| @testing-library/jest-dom | 6.x | Custom matchers for DOM assertions |

## Code Quality

| Technology | Version | Rationale |
|---|---|---|
| ESLint | 8.x | Static analysis, catch bugs early |
| @typescript-eslint | 7.x | TypeScript-aware linting rules |
| eslint-plugin-react-hooks | 4.x | Enforce Rules of Hooks |
| Prettier | 3.x | Consistent formatting, no style debates |

## Build & Dev

| Technology | Version | Rationale |
|---|---|---|
| Vite | 5.x | Build tool and dev server |
| Node.js | 20.x LTS | Runtime for build tooling |
| npm | 10.x | Package management (ships with Node 20) |

## Configuration Files

| File | Purpose |
|---|---|
| `tsconfig.json` | TypeScript compiler options (strict mode, path aliases) |
| `vite.config.ts` | Vite config (path aliases, proxy for dev API, test config) |
| `tailwind.config.js` | Tailwind theme customization, content paths |
| `postcss.config.js` | PostCSS plugins (tailwindcss, autoprefixer) |
| `.eslintrc.cjs` | ESLint rules and plugins |
| `.prettierrc` | Prettier formatting options |
| `index.html` | Vite entry point |

## Dev Server Configuration

```
Port: 5173 (Vite default)
API Proxy: /api → http://localhost:8000/api (avoid CORS in development)
HMR: enabled (WebSocket)
```

## Production Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      (single JS bundle)
│   ├── index-[hash].css     (Tailwind purged CSS)
│   └── [static assets]
```

**No code splitting** — single bundle for simplicity (internal tool).

## Dependencies Summary

### Production
- react, react-dom
- react-router-dom
- react-hook-form
- tailwindcss (dev dependency for build, but produces production CSS)

### Development
- typescript
- vite, @vitejs/plugin-react
- vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, msw
- eslint, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, eslint-plugin-react-hooks
- prettier
- tailwindcss, postcss, autoprefixer
- jsdom (vitest DOM environment)
