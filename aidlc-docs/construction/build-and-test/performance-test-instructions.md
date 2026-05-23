# Performance Test Instructions

## Purpose
Validate the system meets performance requirements under expected load for a food bank environment (small-scale, single admin user typical, up to 5 concurrent admins max).

## Performance Requirements
- **API Response Time**: < 2 seconds for all endpoints
- **Frontend Initial Load**: < 3 seconds (LCP)
- **Concurrent Users**: 1-5 admin users (food bank scale)
- **Checkout Transaction**: < 2 seconds end-to-end

---

## Setup

### Prerequisites
- Backend running locally or in Docker
- Database seeded with realistic data volume

### Seed Realistic Data

```bash
cd backend
source venv/bin/activate

# Create a script or use Django shell to seed:
python manage.py shell -c "
from core.models import Category, Item, Client
import random

# Create 100 items across categories
cats = list(Category.objects.all())
for i in range(100):
    Item.objects.get_or_create(
        name=f'Item {i}',
        defaults={
            'category': random.choice(cats),
            'cost': round(random.uniform(0.5, 20.0), 2),
            'stock_count': random.randint(0, 200),
            'low_stock_threshold': 10,
        }
    )

# Create 50 clients
for i in range(50):
    Client.objects.get_or_create(
        card_id=f'CARD-{i:04d}',
        defaults={
            'name': f'Client {i}',
            'balance': round(random.uniform(10, 500), 2),
        }
    )
print('Seeded 100 items and 50 clients')
"
```

---

## Test 1: API Response Time

```bash
# Install httpie or use curl with timing

# Health endpoint (baseline)
time curl -s http://localhost:8000/api/health/

# Items list (with 100 items)
time curl -s http://localhost:8000/api/items/ > /dev/null

# Items with search
time curl -s "http://localhost:8000/api/items/?search=Item" > /dev/null

# Clients list (with 50 clients)
time curl -s http://localhost:8000/api/clients/ > /dev/null

# Transactions list
time curl -s http://localhost:8000/api/transactions/ > /dev/null
```

**Target**: All responses < 2 seconds.

---

## Test 2: Frontend Load Time

1. Open browser DevTools → Network tab
2. Navigate to http://localhost:5173 (clear cache first: Ctrl+Shift+R)
3. Measure:
   - **DOMContentLoaded**: Should be < 1s
   - **Load**: Should be < 2s
   - **LCP (Largest Contentful Paint)**: Should be < 3s
4. Check bundle size in Network tab:
   - JS bundle: < 500KB gzipped (acceptable for single bundle)
   - CSS: < 50KB

---

## Test 3: Checkout Performance

```bash
# Login first (get session cookie)
COOKIE=$(curl -s -c - http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}' | grep sessionid | awk '{print $NF}')

# Time a checkout flow
time {
  # Create cart
  CART=$(curl -s http://localhost:8000/api/carts/ \
    -H "Content-Type: application/json" \
    -H "Cookie: sessionid=$COOKIE" \
    -d '{"client": 1}' | python -c "import sys,json; print(json.load(sys.stdin)['id'])")

  # Add item
  curl -s http://localhost:8000/api/carts/$CART/items/ \
    -H "Content-Type: application/json" \
    -H "Cookie: sessionid=$COOKIE" \
    -d '{"item": 1, "quantity": 2}' > /dev/null

  # Process checkout
  curl -s http://localhost:8000/api/carts/$CART/checkout/ \
    -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: sessionid=$COOKIE" > /dev/null
}
```

**Target**: Complete checkout flow < 2 seconds.

---

## Analysis

| Metric | Target | Status |
|---|---|---|
| API response (items list) | < 2s | [Measure] |
| API response (search) | < 2s | [Measure] |
| API response (checkout) | < 2s | [Measure] |
| Frontend LCP | < 3s | [Measure] |
| JS bundle size | < 500KB gzip | [Measure] |

## Notes
- This is an internal tool for 1-5 concurrent admins at a food bank
- SQLite handles this load easily without optimization
- No load testing tools (k6, JMeter) needed at this scale
- Performance testing is primarily about verifying no egregious slowness exists
