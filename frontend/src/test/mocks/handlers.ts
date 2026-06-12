import { http, HttpResponse } from 'msw';
import { mockCategories, mockItems, mockNeighbours, mockCart, mockTransactionList, mockTransaction, mockItemsSoldReport } from './data';

export const handlers = [
  // Auth
  http.get('*/api/auth/session/', () => {
    return HttpResponse.json({ user: { id: 1, username: 'admin' } });
  }),

  http.post('*/api/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({ user: { id: 1, username: 'admin' } });
    }
    return HttpResponse.json({ error: 'Invalid Credentials' }, { status: 401 });
  }),

  http.post('*/api/auth/logout/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Categories
  http.get('*/api/categories/', () => {
    return HttpResponse.json(mockCategories);
  }),

  http.post('*/api/categories/', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 99, name: body.name, item_count: 0 }, { status: 201 });
  }),

  http.put('*/api/categories/:id/', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 1, name: body.name, item_count: 0 });
  }),

  http.delete('*/api/categories/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Items
  http.get('*/api/items/', ({ request }) => {
    const url = new URL(request.url);
    const lowStock = url.searchParams.get('low_stock');
    const category = url.searchParams.get('category');
    let filtered = mockItems;
    if (lowStock === 'true') {
      filtered = filtered.filter((i) => i.is_low_stock);
    }
    if (category) {
      filtered = filtered.filter((i) => i.category === Number(category));
    }
    return HttpResponse.json(filtered);
  }),

  http.get('*/api/items/:id/', ({ params }) => {
    const item = mockItems.find((i) => i.id === Number(params.id));
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('*/api/items/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 99, ...body, category_name: 'Dairy', is_low_stock: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  http.put('*/api/items/:id/', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body, category_name: 'Dairy', is_low_stock: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }),

  http.delete('*/api/items/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  http.patch('*/api/items/:id/stock/', () => {
    return HttpResponse.json({ ...mockItems[0], stock_count: 25 });
  }),

  // Neighbours
  http.get('*/api/neighbours/', () => {
    return HttpResponse.json(mockNeighbours);
  }),

  http.get('*/api/neighbours/lookup/', ({ request }) => {
    const url = new URL(request.url);
    const cardId = url.searchParams.get('card_id');
    const neighbour = mockNeighbours.find((c) => c.card_id === cardId);
    if (!neighbour) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(neighbour);
  }),

  http.get('*/api/neighbours/:id/', ({ params }) => {
    const neighbour = mockNeighbours.find((c) => c.id === Number(params.id));
    if (!neighbour) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(neighbour);
  }),

  http.post('*/api/neighbours/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 99, ...body, balance: '0.00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  http.put('*/api/neighbours/:id/', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body, balance: '50.00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }),

  http.post('*/api/neighbours/:id/balance/', () => {
    return HttpResponse.json({ ...mockNeighbours[0], balance: '100.00' });
  }),

  http.post('*/api/neighbours/reset-balances/', () => {
    return HttpResponse.json({ reset_count: 2 });
  }),

  // Carts
  http.get('*/api/carts/:id/', () => {
    return HttpResponse.json(mockCart);
  }),

  http.post('*/api/carts/', () => {
    return HttpResponse.json(mockCart, { status: 201 });
  }),

  http.post('*/api/carts/:id/items/', () => {
    return HttpResponse.json({ id: 3, item: 1, item_name: 'Milk', item_cost: '4.50', quantity: 1, line_total: '4.50' }, { status: 201 });
  }),

  http.patch('*/api/carts/:id/items/:itemId/', () => {
    return HttpResponse.json({ id: 1, item: 1, item_name: 'Milk', item_cost: '4.50', quantity: 3, line_total: '13.50' });
  }),

  http.delete('*/api/carts/:id/items/:itemId/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  http.post('*/api/carts/:id/checkout/', () => {
    return HttpResponse.json(mockTransaction);
  }),

  http.delete('*/api/carts/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Transactions
  http.get('*/api/transactions/', () => {
    return HttpResponse.json(mockTransactionList);
  }),

  http.get('*/api/transactions/:id/', ({ params }) => {
    if (Number(params.id) === 1) return HttpResponse.json(mockTransaction);
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),

  // Reports
  http.get('*/api/reports/items-sold/', () => {
    return HttpResponse.json(mockItemsSoldReport);
  }),
];
