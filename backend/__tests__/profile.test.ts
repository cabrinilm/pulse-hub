// __tests__/profile.test.ts
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { app } from '../src/index';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

describe('Profile Routes (Integration)', () => {
  let userId: string;
  let userSupabase: ReturnType<typeof createClient>;
  let username: string;

  beforeEach(async () => {
    const token = process.env.SUPABASE_BEARER_TOKEN as string;
    if (!token) throw new Error('Missing SUPABASE_BEARER_TOKEN');

    userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await userSupabase.auth.getUser();
    expect(error).toBeNull();
    expect(user).not.toBeNull();
    userId = user!.id;
    username = `t${Date.now()}`;
   
    await userSupabase.from('profiles').delete().eq('user_id', userId);
  });

  afterEach(async () => {
    await userSupabase.from('profiles').delete().eq('user_id', userId);
  });

  it('should create profile with valid username and token', async () => {

    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${process.env.SUPABASE_BEARER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ username });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Profile created/updated');
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.headers['access-control-allow-origin']).toBe('*');

    const { data, error } = await userSupabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    expect(error).toBeNull();
  
  });

  it('should return 400 for duplicate username', async () => {
    const username = 'u1759421250712';
   
 
    const duplicateResponse = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${process.env.SUPABASE_BEARER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ username });
  
             console.log(duplicateResponse.body)
    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body).toHaveProperty('error', 'Username already taken');
    expect(duplicateResponse.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return 400 for invalid username format', async () => {
    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${process.env.SUPABASE_BEARER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ username: 'ab' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Username must be 3-20 alphanumeric characters');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/profile')
      .set('Content-Type', 'application/json')
      .send({ username: 'testuser' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});