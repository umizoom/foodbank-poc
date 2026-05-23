# Unit Test Execution

## Backend Unit Tests

### 1. Setup Test Environment

```bash
cd backend
source venv/bin/activate
pip install -r requirements/dev.txt
```

### 2. Run All Backend Tests

```bash
pytest
```

### 3. Run with Coverage

```bash
pytest --cov=core --cov-report=term-missing
```

### 4. Run Specific Test Categories

```bash
# Model tests only
pytest core/tests/test_models.py

# Service layer tests
pytest core/tests/test_services.py

# API view tests
pytest core/tests/test_views.py

# Property-based tests (Hypothesis)
pytest core/tests/test_properties.py
```

### 5. Expected Results

- **Total Tests**: ~50+ tests
- **Expected**: All pass (0 failures)
- **Coverage Target**: > 80% line coverage on `core/`
- **Test Report**: Console output (pytest terminal)

---

## Frontend Unit Tests

### 1. Setup Test Environment

```bash
cd frontend
npm install
```

### 2. Run All Frontend Tests

```bash
npm test
```

### 3. Run with Coverage

```bash
npm run test:coverage
```

### 4. Run Specific Test Files

```bash
# Shared component tests
npx vitest run src/shared/components/__tests__/

# Auth feature tests
npx vitest run src/features/auth/__tests__/

# Inventory feature tests
npx vitest run src/features/inventory/__tests__/

# Client feature tests
npx vitest run src/features/clients/__tests__/

# Checkout feature tests
npx vitest run src/features/checkout/__tests__/

# Hook tests
npx vitest run src/shared/hooks/__tests__/

# API client tests
npx vitest run src/shared/api/__tests__/
```

### 5. Expected Results

- **Total Tests**: ~40+ tests
- **Expected**: All pass (0 failures)
- **Coverage Target**: > 70% line coverage
- **Test Report**: Console output (vitest terminal)

---

## Fix Failing Tests

If tests fail:

1. Read the test output — identify the failing test name and error message
2. Check if it's a test issue or code issue:
   - **Assertion failed**: Code may have a bug — check the tested function
   - **Import error**: Module path may be wrong — check path aliases
   - **Timeout**: Async operation not resolving — check MSW handlers or API mocks
3. Fix the issue in the source code (not the test, unless the test expectation is wrong)
4. Re-run the specific failing test to confirm the fix
5. Re-run the full suite to ensure no regressions
