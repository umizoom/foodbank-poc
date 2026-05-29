import { http, HttpResponse } from 'msw';
import { mockCategories, mockItems, mockClients, mockCart, mockTransactionList, mockTransaction } from './data';

export const handlers = [
  // Auth
  http.get('/api/auth/session/', () => {
    return HttpResponse.json({ user: { id: 1, username: 'admin' } });
  }),

  http.post('/api/auth/login/', async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };
    if (body.username === 'admin' && body.password === 'password') {
      return HttpResponse.json({ user: { id: 1, username: 'admin' } });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/auth/logout/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Categories
  http.get('/api/categories/', () => {
    return HttpResponse.json(mockCategories);
  }),

  http.post('/api/categories/', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 99, name: body.name, item_count: 0 }, { status: 201 });
  }),

  http.put('/api/categories/:id/', async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({ id: 1, name: body.name, item_count: 0 });
  }),

  http.delete('/api/categories/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Items
  http.get('/api/items/', ({ request }) => {
    const url = new URL(request.url);
    const lowStock = url.searchParams.get('low_stock');
    if (lowStock === 'true') {
      return HttpResponse.json(mockItems.filter((i) => i.is_low_stock));
    }
    return HttpResponse.json(mockItems);
  }),

  http.get('/api/items/:id/', ({ params }) => {
    const item = mockItems.find((i) => i.id === Number(params.id));
    if (!item) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(item);
  }),

  http.post('/api/items/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 99, ...body, category_name: 'Dairy', is_low_stock: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  http.put('/api/items/:id/', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body, category_name: 'Dairy', is_low_stock: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }),

  http.delete('/api/items/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  http.patch('/api/items/:id/stock/', () => {
    return HttpResponse.json({ ...mockItems[0], stock_count: 25 });
  }),

  // Clients
  http.get('/api/clients/', () => {
    return HttpResponse.json(mockClients);
  }),

  http.get('/api/clients/lookup/', ({ request }) => {
    const url = new URL(request.url);
    const cardId = url.searchParams.get('card_id');
    const client = mockClients.find((c) => c.card_id === cardId);
    if (!client) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(client);
  }),

  http.get('/api/clients/:id/', ({ params }) => {
    const client = mockClients.find((c) => c.id === Number(params.id));
    if (!client) return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    return HttpResponse.json(client);
  }),

  http.post('/api/clients/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: 99, ...body, balance: '0.00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { status: 201 });
  }),

  http.put('/api/clients/:id/', async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id: Number(params.id), ...body, balance: '50.00', created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  }),

  http.post('/api/clients/:id/balance/', () => {
    return HttpResponse.json({ ...mockClients[0], balance: '100.00' });
  }),

  // Carts
  http.get('/api/carts/:id/', () => {
    return HttpResponse.json(mockCart);
  }),

  http.post('/api/carts/', () => {
    return HttpResponse.json(mockCart, { status: 201 });
  }),

  http.post('/api/carts/:id/items/', () => {
    return HttpResponse.json({ id: 3, item: 1, item_name: 'Milk', item_cost: '4.50', quantity: 1, line_total: '4.50' }, { status: 201 });
  }),

  http.patch('/api/carts/:id/items/:itemId/', () => {
    return HttpResponse.json({ id: 1, item: 1, item_name: 'Milk', item_cost: '4.50', quantity: 3, line_total: '13.50' });
  }),

  http.delete('/api/carts/:id/items/:itemId/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  http.post('/api/carts/:id/checkout/', () => {
    return HttpResponse.json(mockTransaction);
  }),

  http.delete('/api/carts/:id/', () => {
    return HttpResponse.json(null, { status: 204 });
  }),

  // Transactions
  http.get('/api/transactions/', () => {
    return HttpResponse.json(mockTransactionList);
  }),

  http.get('/api/transactions/:id/', ({ params }) => {
    if (Number(params.id) === 1) return HttpResponse.json(mockTransaction);
    return HttpResponse.json({ detail: 'Not found' }, { status: 404 });
  }),
];
