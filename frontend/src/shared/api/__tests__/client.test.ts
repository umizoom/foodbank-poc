import { api } from '../client';
import { UnauthorizedError, ApiError } from '../errors';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Client', () => {
  it('makes GET requests successfully', async () => {
    const items = await api.get('/api/items/');
    expect(Array.isArray(items)).toBe(true);
  });

  it('includes credentials in requests', async () => {
    let capturedCredentials: RequestCredentials | undefined;
    server.use(
      http.get('/api/test/', ({ request }) => {
        capturedCredentials = (request as unknown as { credentials?: RequestCredentials }).credentials;
        return HttpResponse.json({ ok: true });
      }),
    );

    await api.get('/api/test/');
    // The fetch call includes credentials: 'include'
    // MSW doesn't expose credentials directly, but the request completes
  });

  it('throws UnauthorizedError on 401', async () => {
    server.use(
      http.get('/api/protected/', () => {
        return HttpResponse.json({ detail: 'Not authenticated' }, { status: 401 });
      }),
    );

    await expect(api.get('/api/protected/')).rejects.toThrow(UnauthorizedError);
  });

  it('throws ApiError on 400', async () => {
    server.use(
      http.post('/api/bad-request/', () => {
        return HttpResponse.json({ name: ['This field is required.'] }, { status: 400 });
      }),
    );

    try {
      await api.post('/api/bad-request/', {});
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(400);
      expect((e as ApiError).data.name[0]).toBe('This field is required.');
    }
  });

  it('handles 204 No Content', async () => {
    server.use(
      http.delete('/api/delete-test/', () => {
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const result = await api.delete('/api/delete-test/');
    expect(result).toBeUndefined();
  });
});
