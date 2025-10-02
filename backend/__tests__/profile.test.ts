// __tests__/profile.test.ts
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { app } from '../src/index';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

describe('Profile Routes (Integration with real token)', () => {
  let userId: string;
  let userSupabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    const token = process.env.SUPABASE_BEARER_TOKEN as string;

    if (!token) throw new Error('Missing SUPABASE_BEARER_TOKEN');

    // Supabase client do usuário
    userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await userSupabase.auth.getUser(token);

    if (error || !user) throw new Error('Invalid token');

    userId = user.id;

    // Limpa profile antes do teste
    await userSupabase.from('profiles').delete().eq('user_id', userId);
  });

  afterAll(async () => {
    // Limpa profile depois do teste
    await userSupabase.from('profiles').delete().eq('user_id', userId);
  });

  it('should create profile with valid username and token', async () => {
    const username = 'integrationuser';

    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${process.env.SUPABASE_BEARER_TOKEN}`)
      .set('Content-Type', 'application/json')
      .send({ username }); // Não precisa passar user_id, será lido do token

    console.log(response.status, response.body); // Debug

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Profile created/updated');

    // Verifica no Supabase se o profile foi criado
    const { data, error } = await userSupabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    expect(error).toBeNull();
    // expect(data?.username).toBe(username);
  });
});
