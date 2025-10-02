import request from 'supertest';
import {app} from '../src/index';
import { supabase } from '../src/services/supabaseClient.ts';


describe('Profile Routes (integration with real token)', () => {
  const testUserId = '98234733-7397-4478-9e8b-504761923450'; 
  const token = process.env.SUPABASE_BEARER_TOKEN as string;

  beforeEach(async () => {
    await supabase.from('profiles').delete().eq('user_id', testUserId);
  });

  it('should create profile with valid username and real token', async () => {
    const response = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'integrationuser' });

    expect(response.status).toBe(201);

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    expect(data?.username).toBe('integrationuser');
  });
});