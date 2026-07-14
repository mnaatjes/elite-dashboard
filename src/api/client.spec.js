import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, API_BASE_URL } from './client';

global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('constructs correct URL and default headers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await apiClient('/test-endpoint');

    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/test-endpoint`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });

  it('throws Error on non-ok response with json payload', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ detail: 'Custom Server Error' }),
      status: 400
    });

    await expect(apiClient('/test-error')).rejects.toThrow('Custom Server Error');
  });
});
