// __tests__/community.test.ts
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { app } from '../src/index';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const bearerToken = process.env.SUPABASE_BEARER_TOKEN!;

describe('Community Routes (Integration)', () => {
  let userId: string;
  let supabase: ReturnType<typeof createClient>;
  const authHeader = { Authorization: `Bearer ${bearerToken}` };

  // Helpers
  const uniqueName = () => `Community${Date.now()}`;
  const makeRequest = (method: 'post' | 'get' | 'patch' | 'delete', url: string, body?: object) => {
    let req = request(app)[method](url).set('Authorization', `Bearer ${bearerToken}`).set('Content-Type', 'application/json');
    if (body) req = req.send(body);
    return req;
  };

  beforeAll(async () => {
    if (!bearerToken) throw new Error('Missing SUPABASE_BEARER_TOKEN');
    supabase = createClient(supabaseUrl, supabaseKey, { global: { headers: authHeader } });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Test user not found');
    userId = user.id;
  });

  afterEach(async () => {
    await supabase.from('communities').delete().eq('creator_id', userId);
  });

  describe('POST /api/communities', () => {
    it('creates a community successfully', async () => {
      const name = 'Peace Community';
      const res = await makeRequest('post', '/api/communities', { name, description: 'Test Desc' });
 
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(name);
    });

    it('fails with duplicate name', async () => {
      const name = uniqueName();
      await makeRequest('post', '/api/communities', { name, description: 'First' });

      const res = await makeRequest('post', '/api/communities', { name, description: 'Second' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Community name already exists');
    });

    it('fails with invalid name format', async () => {
      const res = await makeRequest('post', '/api/communities', { name: 'A@', description: 'Invalid' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/communities', () => {
    it('returns all communities', async () => {
      await makeRequest('post', '/api/communities', { name: uniqueName(), description: 'Desc 1' });
      await makeRequest('post', '/api/communities', { name: uniqueName(), description: 'Desc 2' });

      const res = await makeRequest('get', '/api/communities');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/communities/:id', () => {
    it('returns community by id', async () => {
      const { body: created } = await makeRequest('post', '/api/communities', { name: uniqueName(), description: 'Desc' });

      const res = await makeRequest('get', `/api/communities/${created.id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe(created.name);
    });

    it('returns 500 for non-existent id', async () => {
      const res = await makeRequest('get', '/api/communities/non-existent-id');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/communities/:id', () => {
    it('updates community successfully', async () => {
      // 1️⃣ Cria a comunidade
      const { body: created } = await makeRequest(
        'post',
        '/api/communities',
        { name: uniqueName(), description: 'Old' }
      );
  
      console.log('Created community:', created);
  
      // 2️⃣ Verifica o creator_id da comunidade criada
      const { data: community } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', created.id)
        .single();
      console.log('Community creator_id:', community, 'User ID:', userId);
  
      // 3️⃣ Atualiza a comunidade
      const newName = uniqueName();
      const res = await makeRequest(
        'patch',
        `/api/communities/${created.id}`,
        { name: newName, description: 'Updated' }
      );
  
      console.log('Updated response:', res.body);
  
      // 4️⃣ Asserts
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated');
      expect(res.body.name).toBe(newName);
    });
  });

  describe('DELETE /api/communities/:id', () => {
    it('deletes community successfully', async () => {
      const { body: created } = await makeRequest('post', '/api/communities', { name: uniqueName(), description: 'To Delete' });

      const res = await makeRequest('delete', `/api/communities/${created.id}`);
      expect(res.status).toBe(204);

      const check = await makeRequest('get', `/api/communities/${created.id}`);
      expect(check.status).toBe(404);
    });
  });
});
