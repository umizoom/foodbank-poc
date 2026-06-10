import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  // Workaround: MSW's fetch interceptor creates a native Request with the signal,
  // but jsdom's AbortSignal fails Node's instanceof check. Wrap the MSW-patched
  // fetch to strip signal before it reaches the interceptor's Request constructor.
  const mswFetch = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.signal) {
      const { signal, ...rest } = init;
      return mswFetch(input, rest);
    }
    return mswFetch(input, init);
  };
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
