import { describe, it, expect } from 'vitest';
import * as PublishAPI from '@/app/api/publish/route';

describe('Publish API (retired)', () => {
  it('GET returns 410 Gone with no article data', async () => {
    const response = await PublishAPI.GET();
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toBe('Gone');
    expect(body).not.toHaveProperty('data');
  });

  it('POST returns 410 Gone without persisting', async () => {
    const request = new Request('http://localhost:3000/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: 'should-not-persist' }),
    });

    const response = await PublishAPI.POST(request);
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toBe('Gone');
  });

  it('PUT returns 410 Gone without updating', async () => {
    const request = new Request('http://localhost:3000/api/publish', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1, headline: 'should-not-update' }),
    });

    const response = await PublishAPI.PUT(request);
    const body = await response.json();

    expect(response.status).toBe(410);
    expect(body.error).toBe('Gone');
  });
});
